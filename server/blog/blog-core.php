<?php
declare(strict_types=1);

final class RtmBlogError extends RuntimeException
{
    public function __construct(public readonly int $httpStatus, string $message)
    {
        parent::__construct($message);
    }
}

function rtm_fail(int $status, string $message): never
{
    throw new RtmBlogError($status, $message);
}

function rtm_json(array $value, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}

function rtm_private_dir(): string
{
    static $directory = null;
    if (is_string($directory)) {
        return $directory;
    }
    $configured = getenv('RTM_BLOG_DATA_DIR');
    $path = is_string($configured) && $configured !== '' ? $configured : dirname(__DIR__, 2) . '/rtm-blog-private';
    if (is_link($path) || (!is_dir($path) && !@mkdir($path, 0700, true))) {
        rtm_fail(503, 'A hospedagem precisa permitir a criação da pasta privada do blog, fora de public_html.');
    }
    $resolved = realpath($path);
    $public = realpath(dirname(__DIR__));
    if ($resolved === false || $public === false || $resolved === $public || str_starts_with($resolved, $public . DIRECTORY_SEPARATOR) || !is_writable($resolved)) {
        rtm_fail(503, 'A pasta privada do blog precisa ficar fora de public_html e permitir gravação.');
    }
    @chmod($resolved, 0700);
    $directory = $resolved;
    return $directory;
}

function rtm_with_lock(callable $operation, int $mode = LOCK_EX): mixed
{
    $handle = @fopen(rtm_private_dir() . '/blog.lock', 'c+');
    if ($handle === false) {
        rtm_fail(503, 'Não foi possível acessar o armazenamento privado do blog.');
    }
    @chmod(rtm_private_dir() . '/blog.lock', 0600);
    if (!flock($handle, $mode)) {
        fclose($handle);
        rtm_fail(503, 'O armazenamento do blog está ocupado. Tente novamente.');
    }
    try {
        return $operation();
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

function rtm_read_json(string $filename, mixed $default): mixed
{
    $path = rtm_private_dir() . '/' . $filename;
    if (!is_file($path)) {
        return $default;
    }
    $json = @file_get_contents($path);
    if ($json === false) {
        rtm_fail(503, 'Não foi possível ler os dados do blog.');
    }
    try {
        return json_decode($json, true, 64, JSON_THROW_ON_ERROR);
    } catch (JsonException $error) {
        rtm_fail(500, 'Os dados do blog precisam de verificação. Nenhum arquivo foi substituído.');
    }
}

// Call only while holding the common exclusive lock.
function rtm_write_json(string $filename, array $value): void
{
    $json = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
    $temp = rtm_private_dir() . '/.tmp-' . bin2hex(random_bytes(12));
    $handle = @fopen($temp, 'xb');
    if ($handle === false) {
        rtm_fail(503, 'Não foi possível preparar a gravação do blog.');
    }
    @chmod($temp, 0600);
    try {
        $offset = 0;
        while ($offset < strlen($json)) {
            $written = fwrite($handle, substr($json, $offset));
            if ($written === false || $written === 0) {
                rtm_fail(503, 'Não foi possível gravar os dados do blog.');
            }
            $offset += $written;
        }
        if (!fflush($handle)) {
            rtm_fail(503, 'Não foi possível concluir a gravação do blog.');
        }
        if (function_exists('fsync')) {
            @fsync($handle);
        }
        fclose($handle);
        $handle = null;
        if (!@rename($temp, rtm_private_dir() . '/' . $filename)) {
            rtm_fail(503, 'Não foi possível concluir a gravação do blog.');
        }
        @chmod(rtm_private_dir() . '/' . $filename, 0600);
    } finally {
        if (is_resource($handle)) {
            fclose($handle);
        }
        if (is_file($temp)) {
            @unlink($temp);
        }
    }
}

function rtm_primary_configuration(): array
{
    static $configuration = null;
    if (is_array($configuration)) {
        return $configuration;
    }
    $environment = [getenv('RTM_BLOG_PRIMARY_USER'), getenv('RTM_BLOG_PRIMARY_HASH'), getenv('RTM_BLOG_PROVISION_ID')];
    if (array_filter($environment, fn(mixed $value): bool => $value !== false) !== []) {
        $candidate = ['username' => $environment[0], 'passwordHash' => $environment[1], 'provisioningId' => $environment[2]];
    } else {
        $file = __DIR__ . '/blog-install.php';
        $installed = is_file($file) ? require $file : [];
        $candidate = is_array($installed) ? ($installed['primary_account'] ?? null) : null;
    }
    if (!is_array($candidate) || !is_string($candidate['username'] ?? null)
        || !preg_match('/^[a-zA-Z0-9][a-zA-Z0-9._-]{2,63}$/D', $candidate['username'])
        || !is_string($candidate['passwordHash'] ?? null)
        || (password_get_info($candidate['passwordHash'])['algoName'] ?? 'unknown') === 'unknown'
        || !is_string($candidate['provisioningId'] ?? null)
        || !preg_match('/^[a-zA-Z0-9._-]{8,128}$/D', $candidate['provisioningId'])) {
        rtm_fail(503, 'O acesso principal precisa estar incluído no pacote atualizado do site.');
    }
    $configuration = $candidate;
    return $configuration;
}

function rtm_read_user_state(): ?array
{
    $state = rtm_read_json('users.json', null);
    if ($state === null) {
        return null;
    }
    if (!is_array($state) || !is_string($state['appliedProvisioningId'] ?? null)
        || !is_array($state['users'] ?? null) || !array_is_list($state['users'])) {
        rtm_fail(500, 'A configuração dos acessos precisa de verificação.');
    }
    $ids = [];
    $names = [];
    $administrators = 0;
    foreach ($state['users'] as $user) {
        if (!is_array($user) || !is_string($user['id'] ?? null) || !preg_match('/^[a-f0-9]{32}$/D', $user['id'])
            || !is_string($user['username'] ?? null) || !preg_match('/^[a-zA-Z0-9][a-zA-Z0-9._-]{2,63}$/D', $user['username'])
            || !is_string($user['passwordHash'] ?? null) || (password_get_info($user['passwordHash'])['algoName'] ?? 'unknown') === 'unknown'
            || !in_array($user['role'] ?? '', ['admin', 'editor'], true)
            || !is_string($user['credentialVersion'] ?? null) || !preg_match('/^[a-f0-9]{32}$/D', $user['credentialVersion'])
            || !is_string($user['createdAt'] ?? null) || !is_string($user['updatedAt'] ?? null)
            || isset($ids[$user['id']]) || isset($names[strtolower($user['username'])])) {
            rtm_fail(500, 'A configuração dos acessos precisa de verificação.');
        }
        $ids[$user['id']] = true;
        $names[strtolower($user['username'])] = true;
        if ($user['role'] === 'admin') {
            $administrators++;
        }
    }
    if ($administrators !== 1) {
        rtm_fail(500, 'A configuração do acesso principal precisa de verificação.');
    }
    return $state;
}

function rtm_initialize_accounts(): void
{
    static $initialized = false;
    if ($initialized) {
        return;
    }
    $configuration = rtm_primary_configuration();
    rtm_with_lock(function () use ($configuration): void {
        $state = rtm_read_user_state();
        if ($state !== null && hash_equals($state['appliedProvisioningId'], $configuration['provisioningId'])) {
            return;
        }
        $users = $state['users'] ?? [];
        $principalIndex = null;
        foreach ($users as $index => $user) {
            if ($user['role'] === 'admin') {
                $principalIndex = $index;
            } elseif (strtolower($user['username']) === strtolower($configuration['username'])) {
                rtm_fail(503, 'O usuário principal configurado coincide com outro acesso. Confira o pacote de instalação.');
            }
        }
        $existing = $principalIndex === null ? null : $users[$principalIndex];
        $now = rtm_now();
        $principal = [
            'id' => $existing['id'] ?? bin2hex(random_bytes(16)),
            'username' => $configuration['username'],
            'passwordHash' => $configuration['passwordHash'],
            'role' => 'admin',
            'credentialVersion' => bin2hex(random_bytes(16)),
            'createdAt' => $existing['createdAt'] ?? $now,
            'updatedAt' => $now,
        ];
        if ($principalIndex === null) {
            $users[] = $principal;
        } else {
            $users[$principalIndex] = $principal;
        }
        // Legacy account.json is no longer an authentication source. Posts and
        // uploads are preserved; only the trusted delivery provisions the owner.
        rtm_write_json('users.json', ['appliedProvisioningId' => $configuration['provisioningId'], 'users' => array_values($users)]);
    });
    $initialized = true;
}

function rtm_user_summary(array $user): array
{
    return ['id' => $user['id'], 'username' => $user['username'], 'role' => $user['role'], 'createdAt' => $user['createdAt']];
}

function rtm_validate_username(array $input): string
{
    $username = rtm_text($input, 'username', 64);
    if (!preg_match('/^[a-zA-Z0-9][a-zA-Z0-9._-]{2,63}$/D', $username)) {
        rtm_fail(422, 'Escolha um usuário de 3 a 64 caracteres, usando letras, números, ponto, hífen ou sublinhado.');
    }
    return $username;
}

function rtm_validate_new_password(array $input, string $key = 'password'): string
{
    $password = $input[$key] ?? null;
    if (!is_string($password) || !preg_match('//u', $password) || rtm_length($password) < 12 || strlen($password) > 72 || str_contains($password, "\0")) {
        rtm_fail(422, 'Escolha uma senha com pelo menos 12 caracteres e no máximo 72 bytes.');
    }
    return $password;
}

function rtm_hash_password(string $password): string
{
    $hash = password_hash($password, PASSWORD_DEFAULT);
    if ($hash === false) {
        rtm_fail(500, 'Não foi possível proteger a senha. Tente novamente.');
    }
    return $hash;
}

// Used inside the write lock, so access revocation and password changes cannot
// race with account-management writes. Never rely only on a client-sent role.
function rtm_check_actor(array $state, array $actor, bool $administrator = false): array
{
    foreach ($state['users'] as $user) {
        if (hash_equals($user['id'], $actor['id']) && hash_equals($user['credentialVersion'], $actor['credentialVersion'])) {
            if ($administrator && $user['role'] !== 'admin') {
                rtm_fail(403, 'Somente o acesso principal pode administrar os acessos.');
            }
            return $user;
        }
    }
    rtm_fail(401, 'Este acesso foi alterado ou revogado. Entre novamente para continuar.');
}

function rtm_read_posts(): array
{
    $posts = rtm_read_json('posts.json', []);
    if (!is_array($posts) || !array_is_list($posts)) {
        rtm_fail(500, 'Os artigos precisam de verificação. Nenhum arquivo foi substituído.');
    }
    foreach ($posts as $post) {
        if (!is_array($post) || !is_string($post['id'] ?? null) || !is_string($post['slug'] ?? null) || !is_string($post['updatedAt'] ?? null)) {
            rtm_fail(500, 'Os artigos precisam de verificação. Nenhum arquivo foi substituído.');
        }
    }
    return $posts;
}

function rtm_start_session(): void
{
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_name('RTMBLOGSESSID');
    $secure = (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off') || (int) ($_SERVER['SERVER_PORT'] ?? 0) === 443;
    session_set_cookie_params(['lifetime' => 0, 'path' => '/api/', 'secure' => $secure, 'httponly' => true, 'samesite' => 'Strict']);
    if (!session_start()) {
        rtm_fail(503, 'A hospedagem não permitiu iniciar a sessão do painel.');
    }
    $now = time();
    if (isset($_SESSION['lastActivity']) && $now - (int) $_SESSION['lastActivity'] > 1800) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    $_SESSION['lastActivity'] = $now;
    if (!isset($_SESSION['csrf']) || !is_string($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
}

function rtm_authenticated_user(): ?array
{
    rtm_initialize_accounts();
    if (!is_string($_SESSION['userId'] ?? null) || !is_string($_SESSION['credentialVersion'] ?? null)) {
        return null;
    }
    return rtm_with_lock(function (): ?array {
        $state = rtm_read_user_state();
        foreach ($state['users'] as $user) {
            if (hash_equals($user['id'], $_SESSION['userId']) && hash_equals($user['credentialVersion'], $_SESSION['credentialVersion'])) {
                return $user;
            }
        }
        unset($_SESSION['userId'], $_SESSION['credentialVersion']);
        return null;
    }, LOCK_SH);
}

function rtm_session_data(): array
{
    $user = rtm_authenticated_user();
    $data = ['authenticated' => $user !== null, 'setupRequired' => false, 'setupConfigured' => true, 'csrfToken' => $_SESSION['csrf']];
    if ($user !== null) {
        $data['username'] = $user['username'];
        $data['role'] = $user['role'];
    }
    return $data;
}

function rtm_authenticate(array $user): void
{
    session_regenerate_id(true);
    $_SESSION = ['userId' => $user['id'], 'credentialVersion' => $user['credentialVersion'], 'csrf' => bin2hex(random_bytes(32)), 'lastActivity' => time()];
}

function rtm_require_csrf(): void
{
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($token) || !hash_equals($_SESSION['csrf'], $token) || ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') {
        rtm_fail(403, 'A sessão de segurança expirou. Atualize o painel e tente novamente.');
    }
}

function rtm_require_auth(): array
{
    $user = rtm_authenticated_user();
    if ($user === null) {
        rtm_fail(401, 'Entre no painel para continuar.');
    }
    return $user;
}

function rtm_require_admin(): array
{
    $user = rtm_require_auth();
    if ($user['role'] !== 'admin') {
        rtm_fail(403, 'Somente o acesso principal pode administrar os acessos.');
    }
    return $user;
}

function rtm_json_input(): array
{
    $type = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
    if ($type !== 'application/json') {
        rtm_fail(415, 'Envie os dados no formato esperado pelo painel.');
    }
    $length = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($length > 1024 * 1024) {
        rtm_fail(413, 'O conteúdo enviado é muito grande.');
    }
    $raw = file_get_contents('php://input', false, null, 0, 1024 * 1024 + 1);
    if ($raw === false || strlen($raw) > 1024 * 1024) {
        rtm_fail(413, 'O conteúdo enviado é muito grande.');
    }
    try {
        $input = json_decode($raw, true, 16, JSON_THROW_ON_ERROR);
    } catch (JsonException $error) {
        rtm_fail(400, 'Os dados enviados são inválidos.');
    }
    if (!is_array($input) || array_is_list($input)) {
        rtm_fail(400, 'Os dados enviados são inválidos.');
    }
    return $input;
}

function rtm_text(array $input, string $key, int $maximum, string $default = ''): string
{
    $labels = ['username' => 'usuário', 'title' => 'título', 'excerpt' => 'resumo', 'content' => 'texto', 'category' => 'categoria', 'status' => 'situação', 'image' => 'imagem', 'imageAlt' => 'descrição da imagem', 'author' => 'assinatura'];
    $label = $labels[$key] ?? 'informado';
    $value = $input[$key] ?? $default;
    if (!is_string($value) || !preg_match('//u', $value) || str_contains($value, "\0")) {
        rtm_fail(422, 'Confira o campo ' . $label . '.');
    }
    $value = trim(str_replace(["\r\n", "\r"], "\n", $value));
    if (rtm_length($value) > $maximum) {
        rtm_fail(422, 'O campo ' . $label . ' ultrapassa o tamanho permitido.');
    }
    return $value;
}

function rtm_length(string $value): int
{
    return preg_match_all('/./us', $value);
}

function rtm_post_fields(array $input): array
{
    $title = rtm_text($input, 'title', 180);
    $excerpt = rtm_text($input, 'excerpt', 320);
    $content = rtm_text($input, 'content', 50000);
    $category = rtm_text($input, 'category', 30, 'institucional');
    $status = rtm_text($input, 'status', 20, 'draft');
    $image = rtm_text($input, 'image', 200);
    $imageAlt = rtm_text($input, 'imageAlt', 300);
    $author = rtm_text($input, 'author', 120, 'RTM Advocacia');
    if (rtm_length($title) < 3) {
        rtm_fail(422, 'Informe um título com pelo menos 3 caracteres.');
    }
    if (!in_array($category, ['civil', 'consumidor', 'medico', 'institucional'], true) || !in_array($status, ['draft', 'published'], true)) {
        rtm_fail(422, 'Selecione uma categoria e uma situação válidas.');
    }
    if ($image !== '') {
        if (!preg_match('#^/uploads/blog/[a-f0-9]{32}\.(jpg|png|webp)$#D', $image) || !is_file(dirname(__DIR__) . $image)) {
            rtm_fail(422, 'Selecione uma imagem enviada pelo painel.');
        }
    }
    if ($status === 'published' && (rtm_length($excerpt) < 10 || rtm_length($content) < 30 || $image === '' || rtm_length($imageAlt) < 3)) {
        rtm_fail(422, 'Para publicar, inclua um resumo de pelo menos 10 caracteres, texto de 30 caracteres, imagem de capa e descrição da imagem.');
    }
    return ['title' => $title, 'excerpt' => $excerpt, 'content' => $content, 'category' => $category, 'image' => $image, 'imageAlt' => $imageAlt, 'author' => $author === '' ? 'RTM Advocacia' : $author, 'status' => $status];
}

function rtm_unique_slug(string $title, array $posts): string
{
    $replace = ['á'=>'a','à'=>'a','â'=>'a','ã'=>'a','ä'=>'a','Á'=>'a','À'=>'a','Â'=>'a','Ã'=>'a','Ä'=>'a','é'=>'e','è'=>'e','ê'=>'e','ë'=>'e','É'=>'e','È'=>'e','Ê'=>'e','Ë'=>'e','í'=>'i','ì'=>'i','î'=>'i','ï'=>'i','Í'=>'i','Ì'=>'i','Î'=>'i','Ï'=>'i','ó'=>'o','ò'=>'o','ô'=>'o','õ'=>'o','ö'=>'o','Ó'=>'o','Ò'=>'o','Ô'=>'o','Õ'=>'o','Ö'=>'o','ú'=>'u','ù'=>'u','û'=>'u','ü'=>'u','Ú'=>'u','Ù'=>'u','Û'=>'u','Ü'=>'u','ç'=>'c','Ç'=>'c','ñ'=>'n','Ñ'=>'n'];
    $base = trim((string) preg_replace('/[^a-z0-9]+/', '-', strtolower(strtr($title, $replace))), '-');
    $base = substr($base === '' ? 'artigo' : $base, 0, 180);
    $base = rtrim($base, '-');
    $used = array_column($posts, 'slug');
    $slug = $base;
    for ($number = 2; in_array($slug, $used, true); $number++) {
        $slug = $base . '-' . $number;
    }
    return $slug;
}

function rtm_now(): string
{
    return (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s.u\Z');
}

function rtm_check_version(array $input, array $existing): void
{
    if (isset($input['updatedAt']) && (!is_string($input['updatedAt']) || !hash_equals($existing['updatedAt'], $input['updatedAt']))) {
        rtm_fail(409, 'Este artigo foi alterado em outra janela. Atualize a lista antes de continuar.');
    }
}

function rtm_throttle_key(): string
{
    return hash('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
}

function rtm_attempts(): array
{
    $attempts = rtm_read_json('attempts.json', []);
    if (!is_array($attempts)) {
        rtm_fail(500, 'O controle de acesso precisa de verificação.');
    }
    foreach ($attempts as $key => $value) {
        if (!is_array($value) || (int) ($value['startedAt'] ?? 0) < time() - 900) {
            unset($attempts[$key]);
        }
    }
    return $attempts;
}

// Throttle helpers are called only inside the exclusive storage lock.
function rtm_check_throttle(): void
{
    $attempts = rtm_attempts();
    if ((int) ($attempts[rtm_throttle_key()]['count'] ?? 0) >= 10) {
        rtm_fail(429, 'Muitas tentativas de acesso. Aguarde 15 minutos antes de tentar novamente.');
    }
}

function rtm_record_failed_attempt(): void
{
    $attempts = rtm_attempts();
    $key = rtm_throttle_key();
    $current = $attempts[$key] ?? ['startedAt' => time(), 'count' => 0];
    $current['count']++;
    $attempts[$key] = $current;
    rtm_write_json('attempts.json', $attempts);
}

function rtm_clear_failed_attempts(): void
{
    $attempts = rtm_attempts();
    unset($attempts[rtm_throttle_key()]);
    rtm_write_json('attempts.json', $attempts);
}

function rtm_upload(): string
{
    if (!class_exists('finfo')) {
        rtm_fail(503, 'A hospedagem precisa habilitar o módulo Fileinfo do PHP para receber imagens.');
    }
    $file = $_FILES['file'] ?? null;
    if (!is_array($file) || !isset($file['error']) || is_array($file['error'])) {
        rtm_fail(422, 'Selecione uma imagem JPG, PNG ou WebP.');
    }
    if (in_array($file['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) {
        rtm_fail(413, 'A imagem excede o limite de envio da hospedagem. Escolha uma imagem menor.');
    }
    if ($file['error'] !== UPLOAD_ERR_OK || !is_string($file['tmp_name'] ?? null) || !is_uploaded_file($file['tmp_name'])) {
        rtm_fail(422, 'Não foi possível receber a imagem. Selecione o arquivo novamente.');
    }
    if ((int) ($file['size'] ?? 0) <= 0 || (int) $file['size'] > 5 * 1024 * 1024) {
        rtm_fail(413, 'Escolha uma imagem de até 5 MB.');
    }
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $dimensions = @getimagesize($file['tmp_name']);
    if (!is_string($mime) || !isset($extensions[$mime]) || $dimensions === false || ($dimensions['mime'] ?? '') !== $mime || $dimensions[0] < 1 || $dimensions[1] < 1 || $dimensions[0] > 6000 || $dimensions[1] > 6000) {
        rtm_fail(422, 'Envie uma imagem JPG, PNG ou WebP válida, com até 6000 pixels em cada lado.');
    }
    $base = dirname(__DIR__) . '/uploads';
    $directory = $base . '/blog';
    if (is_link($base) || is_link($directory) || (!is_dir($directory) && !@mkdir($directory, 0755, true)) || !is_writable($directory)) {
        rtm_fail(503, 'A hospedagem precisa permitir a gravação da pasta uploads/blog.');
    }
    $filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
    $target = $directory . '/' . $filename;
    if (is_file($target) || !move_uploaded_file($file['tmp_name'], $target)) {
        rtm_fail(503, 'Não foi possível salvar a imagem. Tente novamente.');
    }
    @chmod($target, 0644);
    return '/uploads/blog/' . $filename;
}
