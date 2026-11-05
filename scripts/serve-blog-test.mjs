import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// This code and account are isolated test fixtures, never deployment credentials.
const activationCode = 'RTM-BLOG-INTEGRATION-TEST-ACTIVATION-ONLY';
const php = process.env.RTM_PHP_BIN || 'php';
const build = resolve('dist');
if (!existsSync(join(build, 'api', 'blog.php'))) {
  throw new Error('Gere o site com npm run build antes de testar o blog.');
}

const temporaryRoot = mkdtempSync(join(tmpdir(), 'rtm-blog-tests-'));
const documentRoot = join(temporaryRoot, 'site');
const privateData = join(temporaryRoot, 'private');
const sessions = join(temporaryRoot, 'sessions');
cpSync(build, documentRoot, { recursive: true });
mkdirSync(privateData, { mode: 0o700 });
mkdirSync(sessions, { mode: 0o700 });

// PHP's development server otherwise falls back to a parent index.html for
// missing paths. Shared static hosting returns 404 for those paths instead.
const router = join(temporaryRoot, 'router.php');
writeFileSync(router, `<?php
declare(strict_types=1);
$root = realpath($_SERVER['DOCUMENT_ROOT']);
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
if (is_string($path)) {
    $path = rawurldecode($path);
    if (!str_contains($path, "\\0")) {
        $resolved = realpath($root . '/' . ltrim($path, '/'));
        if ($resolved !== false && ($resolved === $root || str_starts_with($resolved, $root . DIRECTORY_SEPARATOR))) {
            if (is_file($resolved)) return false;
            if (is_dir($resolved) && (is_file($resolved . '/index.html') || is_file($resolved . '/index.php'))) return false;
        }
    }
}
http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo 'Recurso não encontrado.';
return true;
`, { mode: 0o600 });

function showPhpErrors(stream) {
  let pending = '';
  const show = line => {
    if (/\bPHP (?:Warning|Fatal error|Parse error|Error)\b|(?:^|\]\s)(?:Fatal error|Parse error|Warning|Error):|Failed to listen|Unable to (?:load|bind)|Could not (?:open|find)/i.test(line)) {
      process.stderr.write(`${line}\n`);
    }
  };
  stream.on('data', chunk => {
    pending += chunk.toString();
    const lines = pending.split(/\r?\n/);
    pending = lines.pop() || '';
    lines.forEach(show);
  });
  stream.on('end', () => { if (pending) show(pending); });
}

let stopping = false;
const child = spawn(php, ['-d', `session.save_path=${sessions}`, '-d', `sys_temp_dir=${temporaryRoot}`, '-S', '127.0.0.1:4180', '-t', documentRoot, router], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: {
    ...process.env,
    RTM_BLOG_DATA_DIR: privateData,
    RTM_BLOG_SETUP_HASH: createHash('sha256').update(activationCode).digest('hex'),
  },
});
showPhpErrors(child.stdout);
showPhpErrors(child.stderr);
const clean = () => rmSync(temporaryRoot, { recursive: true, force: true });
child.on('error', error => {
  clean();
  console.error(`Não foi possível iniciar o PHP para os testes: ${error.message}`);
  process.exitCode = 1;
});
child.on('exit', code => {
  clean();
  process.exit(stopping ? 0 : (code ?? 1));
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    stopping = true;
    child.kill(signal);
  });
}

