<?php
declare(strict_types=1);

require_once __DIR__ . '/blog-core.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, private');
header('Pragma: no-cache');

try {
    $action = $_GET['action'] ?? '';
    if (!is_string($action)) {
        rtm_fail(400, 'A operação solicitada é inválida.');
    }
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $readActions = ['posts', 'post', 'session', 'manage'];
    $writeActions = ['setup', 'login', 'logout', 'save', 'upload', 'delete'];
    if (!in_array($action, array_merge($readActions, $writeActions), true)) {
        rtm_fail(404, 'A operação solicitada não foi encontrada.');
    }
    $expected = in_array($action, $readActions, true) ? 'GET' : 'POST';
    if ($method !== $expected) {
        header('Allow: ' . $expected);
        rtm_fail(405, 'Este método não é permitido para a operação solicitada.');
    }

    // Reading public articles never creates a login session or a session cookie.
    if ($action === 'posts' || $action === 'post') {
        $posts = rtm_with_lock(function (): array {
            return array_values(array_filter(rtm_read_posts(), fn(array $post): bool => ($post['status'] ?? '') === 'published'));
        }, LOCK_SH);
        usort($posts, fn(array $a, array $b): int => strcmp($b['publishedAt'] ?? '', $a['publishedAt'] ?? ''));
        if ($action === 'posts') {
            rtm_json(['posts' => $posts]);
        }
        $slug = $_GET['slug'] ?? '';
        if (!is_string($slug) || !preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D', $slug) || strlen($slug) > 220) {
            rtm_fail(404, 'Artigo não encontrado.');
        }
        foreach ($posts as $post) {
            if ($post['slug'] === $slug) {
                rtm_json(['post' => $post]);
            }
        }
        rtm_fail(404, 'Artigo não encontrado.');
    }

    rtm_start_session();
    if ($action === 'session') {
        rtm_json(rtm_session_data());
    }
    if ($method === 'POST') {
        rtm_require_csrf();
    }
    if ($action === 'setup') {
        $input = rtm_json_input();
        $username = rtm_text($input, 'username', 64);
        if (!preg_match('/^[a-zA-Z0-9][a-zA-Z0-9._-]{2,63}$/D', $username)) {
            rtm_fail(422, 'Escolha um usuário de 3 a 64 caracteres, usando letras, números, ponto, hífen ou sublinhado.');
        }
        $password = $input['password'] ?? null;
        if (!is_string($password) || !preg_match('//u', $password) || rtm_length($password) < 12 || strlen($password) > 72 || str_contains($password, "\0")) {
            rtm_fail(422, 'Escolha uma senha com pelo menos 12 caracteres e no máximo 72 bytes.');
        }
        $activationCode = $input['activationCode'] ?? '';
        if (!is_string($activationCode) || strlen($activationCode) > 256) {
            rtm_fail(422, 'Informe o código de ativação recebido com o pacote do site.');
        }
        rtm_with_lock(function () use ($username, $password, $activationCode): void {
            if (rtm_read_account() !== null) {
                rtm_fail(409, 'O painel já foi ativado. Entre com seu usuário e senha.');
            }
            $hash = rtm_activation_hash();
            if ($hash === '') {
                rtm_fail(503, 'O pacote precisa incluir a configuração de ativação do painel.');
            }
            rtm_check_throttle();
            if (!hash_equals($hash, hash('sha256', trim($activationCode)))) {
                rtm_record_failed_attempt();
                rtm_fail(403, 'Código de ativação inválido. Confira o código recebido com o pacote.');
            }
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            if ($passwordHash === false) {
                rtm_fail(500, 'Não foi possível proteger a senha. Tente novamente.');
            }
            rtm_write_json('account.json', ['username' => $username, 'passwordHash' => $passwordHash, 'createdAt' => rtm_now()]);
            rtm_clear_failed_attempts();
        });
        rtm_authenticate($username);
        rtm_json(rtm_session_data(), 201);
    }
    if ($action === 'login') {
        $input = rtm_json_input();
        $username = rtm_text($input, 'username', 64);
        $password = $input['password'] ?? '';
        if (!is_string($password) || strlen($password) > 200 || str_contains($password, "\0")) {
            rtm_fail(401, 'Usuário ou senha incorretos.');
        }
        $authenticatedUser = rtm_with_lock(function () use ($username, $password): string {
            $account = rtm_read_account();
            if ($account === null) {
                rtm_fail(409, 'Ative o painel antes de entrar.');
            }
            rtm_check_throttle();
            $validPassword = password_verify($password, $account['passwordHash']);
            if (!$validPassword || !hash_equals($account['username'], $username)) {
                rtm_record_failed_attempt();
                rtm_fail(401, 'Usuário ou senha incorretos.');
            }
            if (password_needs_rehash($account['passwordHash'], PASSWORD_DEFAULT)) {
                $account['passwordHash'] = password_hash($password, PASSWORD_DEFAULT);
                rtm_write_json('account.json', $account);
            }
            rtm_clear_failed_attempts();
            return $account['username'];
        });
        rtm_authenticate($authenticatedUser);
        rtm_json(rtm_session_data());
    }
    if ($action === 'logout') {
        $_SESSION = [];
        session_regenerate_id(true);
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        rtm_json(rtm_session_data());
    }

    rtm_require_auth();
    if ($action === 'manage') {
        $posts = rtm_with_lock(fn(): array => rtm_read_posts(), LOCK_SH);
        usort($posts, fn(array $a, array $b): int => strcmp($b['updatedAt'], $a['updatedAt']));
        rtm_json(['posts' => $posts]);
    }
    if ($action === 'upload') {
        rtm_json(['image' => rtm_upload()], 201);
    }
    if ($action === 'save') {
        $input = rtm_json_input();
        $post = rtm_with_lock(function () use ($input): array {
            $posts = rtm_read_posts();
            $id = $input['id'] ?? '';
            if (!is_string($id) || ($id !== '' && !preg_match('/^[a-f0-9]{32}$/D', $id))) {
                rtm_fail(422, 'A identificação do artigo é inválida.');
            }
            $index = null;
            $existing = null;
            if ($id !== '') {
                foreach ($posts as $position => $candidate) {
                    if ($candidate['id'] === $id) {
                        $index = $position;
                        $existing = $candidate;
                        break;
                    }
                }
                if ($existing === null) {
                    rtm_fail(404, 'O artigo não foi encontrado. Atualize a lista e tente novamente.');
                }
                rtm_check_version($input, $existing);
            }
            $fields = rtm_post_fields($input);
            $now = rtm_now();
            $slug = $existing['slug'] ?? rtm_unique_slug($fields['title'], $posts);
            $post = array_merge($fields, [
                'id' => $id === '' ? bin2hex(random_bytes(16)) : $id,
                'slug' => $slug,
                'createdAt' => $existing['createdAt'] ?? $now,
                'updatedAt' => $now,
                'publishedAt' => $existing['publishedAt'] ?? ($fields['status'] === 'published' ? $now : null),
            ]);
            if ($index === null) {
                if (count($posts) >= 1000) {
                    rtm_fail(422, 'O limite de artigos deste painel foi atingido.');
                }
                $posts[] = $post;
            } else {
                $posts[$index] = $post;
            }
            rtm_write_json('posts.json', array_values($posts));
            return $post;
        });
        rtm_json(['post' => $post]);
    }
    if ($action === 'delete') {
        $input = rtm_json_input();
        $id = $input['id'] ?? '';
        if (!is_string($id) || !preg_match('/^[a-f0-9]{32}$/D', $id)) {
            rtm_fail(422, 'A identificação do artigo é inválida.');
        }
        rtm_with_lock(function () use ($input, $id): void {
            $posts = rtm_read_posts();
            foreach ($posts as $index => $post) {
                if ($post['id'] === $id) {
                    rtm_check_version($input, $post);
                    unset($posts[$index]);
                    rtm_write_json('posts.json', array_values($posts));
                    return;
                }
            }
            rtm_fail(404, 'O artigo não foi encontrado.');
        });
        rtm_json(['ok' => true]);
    }
} catch (RtmBlogError $error) {
    rtm_json(['error' => $error->getMessage()], $error->httpStatus);
} catch (Throwable $error) {
    error_log('RTM blog: ' . $error->getMessage());
    rtm_json(['error' => 'Não foi possível concluir a operação. Tente novamente em instantes.'], 500);
}
