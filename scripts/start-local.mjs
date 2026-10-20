import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
process.chdir(root);

try {
  if (Number(process.versions.node.split('.')[0]) < 24) {
    throw new Error('Instale o Node.js 24 LTS em https://nodejs.org/ e abra este iniciador novamente.');
  }

  console.log('\nRTM Advocacia — prévia no seu computador\n');
  const lock = await readFile(resolve(root, 'package-lock.json'));
  const checksum = createHash('sha256').update(lock).digest('hex');
  const markerPath = resolve(root, 'node_modules/.rtm-lock.sha256');
  const previous = await readFile(markerPath, 'utf8').catch(() => '');
  if (!existsSync(resolve(root, 'node_modules/vite/package.json')) || previous !== checksum) {
    console.log('Preparando as dependências. Na primeira vez, isso pode levar alguns minutos.');
    const result = await new Promise((resolveResult, reject) => {
      const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['ci', '--include=dev'], {
        cwd: root,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });
      child.once('error', reject);
      child.once('exit', (code, signal) => resolveResult({ code, signal }));
    });
    if (result.code !== 0) throw new Error('Não foi possível instalar as dependências. Confira a mensagem acima e sua conexão com a internet.');
    await writeFile(markerPath, checksum);
  }

  if (args.has('--setup-only')) {
    console.log('Dependências prontas.');
    process.exit(0);
  }

  const { createServer } = await import('vite');
  const server = await createServer({
    root,
    clearScreen: false,
    server: { host: '127.0.0.1', port: 5173, strictPort: false, open: !args.has('--no-open') },
  });
  await server.listen();
  console.log('\nA prévia está pronta. Se o navegador não abrir, use o endereço abaixo:');
  server.printUrls();
  console.log('\nDeixe esta janela aberta. Arquivos salvos neste computador atualizam a página automaticamente.');
  console.log('Para encerrar, pressione Ctrl+C.\n');
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => { await server.close(); process.exit(0); });
  }
} catch (error) {
  console.error(`\nNão foi possível iniciar: ${error.message}\n`);
  process.exitCode = 1;
}
