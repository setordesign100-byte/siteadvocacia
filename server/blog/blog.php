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
    $readActions = ['posts', 'post', 'session', 'manage', 'users'];
    $writeActions = ['login', 'logout', 'save', 'upload', 'delete', 'create-user', 'revoke-user', 'change-password', 'change-username'];
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
    if ($action === 'login') {
        rtm_initialize_accounts();
        $input = rtm_json_input();
        $username = rtm_text($input, 'username', 64);
        $password = $input['password'] ?? '';
        if (!is_string($password) || strlen($password) > 72 || str_contains($password, "\0")) {
            rtm_fail(401, 'Usuário ou senha incorretos.');
        }
        $authenticatedUser = rtm_with_lock(function () use ($username, $password): array {
            $state = rtm_read_user_state();
            rtm_check_throttle();
            $candidate = null;
            $comparisonHash = '';
            foreach ($state['users'] as $user) {
                if ($user['role'] === 'admin') {
                    $comparisonHash = $user['passwordHash'];
                }
                if (strtolower($user['username']) === strtolower($username)) {
                    $candidate = $user;
                }
            }
            $validPassword = password_verify($password, $candidate['passwordHash'] ?? $comparisonHash);
            if (!$validPassword || $candidate === null) {
                rtm_record_failed_attempt();
                rtm_fail(401, 'Usuário ou senha incorretos.');
            }
            if (password_needs_rehash($candidate['passwordHash'], PASSWORD_DEFAULT)) {
                $candidate['passwordHash'] = rtm_hash_password($password);
                $candidate['updatedAt'] = rtm_now();
                foreach ($state['users'] as $index => $user) {
                    if ($user['id'] === $candidate['id']) {
                        $state['users'][$index] = $candidate;
                    }
                }
                rtm_write_json('users.json', $state);
            }
            rtm_clear_failed_attempts();
            return $candidate;
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

    $actor = rtm_require_auth();
    if ($action === 'manage') {
        $posts = rtm_with_lock(fn(): array => rtm_read_posts(), LOCK_SH);
        usort($posts, fn(array $a, array $b): int => strcmp($b['updatedAt'], $a['updatedAt']));
        rtm_json(['posts' => $posts]);
    }
    if ($action === 'users') {
        rtm_require_admin();
        $users = rtm_with_lock(fn(): array => array_map('rtm_user_summary', rtm_read_user_state()['users']), LOCK_SH);
        rtm_json(['users' => $users]);
    }
    if ($action === 'create-user') {
        rtm_require_admin();
        $input = rtm_json_input();
        $username = rtm_validate_username($input);
        $password = rtm_validate_new_password($input);
        if (array_key_exists('role', $input) && $input['role'] !== 'editor') {
            rtm_fail(403, 'Novos acessos podem receber somente a permissão de publicação.');
        }
        $created = rtm_with_lock(function () use ($input, $username, $password, $actor): array {
            $state = rtm_read_user_state();
            rtm_check_actor($state, $actor, true);
            foreach ($state['users'] as $user) {
                if (strtolower($user['username']) === strtolower($username)) {
                    rtm_fail(409, 'Esse nome de usuário já está em uso. Escolha outro.');
                }
            }
            if (strtolower($username) === strtolower(rtm_primary_configuration()['username'])) {
                rtm_fail(403, 'Esse nome é reservado ao administrador principal. Escolha outro para o editor.');
            }
            if (count($state['users']) >= 101) {
                rtm_fail(422, 'O limite de acessos autorizados foi atingido.');
            }
            $now = rtm_now();
            $user = ['id' => bin2hex(random_bytes(16)), 'username' => $username, 'passwordHash' => rtm_hash_password($password), 'role' => 'editor', 'credentialVersion' => bin2hex(random_bytes(16)), 'createdAt' => $now, 'updatedAt' => $now];
            $state['users'][] = $user;
            rtm_write_json('users.json', $state);
            return $user;
        });
        rtm_json(['user' => rtm_user_summary($created)], 201);
    }
    if ($action === 'revoke-user') {
        rtm_require_admin();
        $input = rtm_json_input();
        $id = $input['id'] ?? '';
        if (!is_string($id) || !preg_match('/^[a-f0-9]{32}$/D', $id)) {
            rtm_fail(422, 'A identificação do acesso é inválida.');
        }
        rtm_with_lock(function () use ($id, $actor): void {
            $state = rtm_read_user_state();
            rtm_check_actor($state, $actor, true);
            foreach ($state['users'] as $index => $user) {
                if ($user['id'] === $id) {
                    if ($user['role'] === 'admin') {
                        rtm_fail(422, 'O acesso principal não pode ser removido.');
                    }
                    unset($state['users'][$index]);
                    $state['users'] = array_values($state['users']);
                    rtm_write_json('users.json', $state);
                    return;
                }
            }
            rtm_fail(404, 'O acesso não foi encontrado.');
        });
        rtm_json(['ok' => true]);
    }
    if ($action === 'change-username') {
        $input = rtm_json_input();
        $currentPassword = $input['currentPassword'] ?? '';
        if (!is_string($currentPassword) || strlen($currentPassword) > 72 || str_contains($currentPassword, "\0")) {
            rtm_fail(422, 'Confira sua senha atual.');
        }
        $username = rtm_validate_username(['username' => $input['newUsername'] ?? null]);
        $changed = rtm_with_lock(function () use ($currentPassword, $username, $actor): array {
            $state = rtm_read_user_state();
            $current = rtm_check_actor($state, $actor);
            rtm_check_throttle();
            if (!password_verify($currentPassword, $current['passwordHash'])) {
                rtm_record_failed_attempt();
                rtm_fail(422, 'A senha atual está incorreta.');
            }
            foreach ($state['users'] as $user) {
                if ($user['id'] !== $current['id'] && strtolower($user['username']) === strtolower($username)) {
                    rtm_fail(409, 'Esse nome de usuário já está em uso. Escolha outro.');
                }
            }
            if ($current['role'] !== 'admin' && strtolower($username) === strtolower(rtm_primary_configuration()['username'])) {
                rtm_fail(403, 'Esse nome é reservado ao administrador principal. Escolha outro.');
            }
            $current['username'] = $username;
            $current['credentialVersion'] = bin2hex(random_bytes(16));
            $current['updatedAt'] = rtm_now();
            foreach ($state['users'] as $index => $user) {
                if ($user['id'] === $current['id']) {
                    $state['users'][$index] = $current;
                }
            }
            rtm_write_json('users.json', $state);
            rtm_clear_failed_attempts();
            return $current;
        });
        rtm_authenticate($changed);
        rtm_json(rtm_session_data());
    }
    if ($action === 'change-password') {
        $input = rtm_json_input();
        $currentPassword = $input['currentPassword'] ?? '';
        if (!is_string($currentPassword) || strlen($currentPassword) > 72 || str_contains($currentPassword, "\0")) {
            rtm_fail(422, 'Confira sua senha atual.');
        }
        $newPassword = rtm_validate_new_password($input, 'newPassword');
        $changed = rtm_with_lock(function () use ($currentPassword, $newPassword, $actor): array {
            $state = rtm_read_user_state();
            $current = rtm_check_actor($state, $actor);
            rtm_check_throttle();
            if (!password_verify($currentPassword, $current['passwordHash'])) {
                rtm_record_failed_attempt();
                rtm_fail(422, 'A senha atual está incorreta.');
            }
            $current['passwordHash'] = rtm_hash_password($newPassword);
            $current['credentialVersion'] = bin2hex(random_bytes(16));
            $current['updatedAt'] = rtm_now();
            foreach ($state['users'] as $index => $user) {
                if ($user['id'] === $current['id']) {
                    $state['users'][$index] = $current;
                }
            }
            rtm_write_json('users.json', $state);
            rtm_clear_failed_attempts();
            return $current;
        });
        rtm_authenticate($changed);
        rtm_json(rtm_session_data());
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
