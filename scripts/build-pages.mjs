import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const dist = resolve('dist');
const html = await readFile(resolve(dist, 'index.html'), 'utf8');
for (const [directory, title, description] of [
  ['blog', 'Blog | RTM Advocacia', 'Publicações e informações da RTM Advocacia sobre Direito Civil, do Consumidor e Médico.'],
  ['painel', 'Painel de publicações | RTM Advocacia', 'Acesso da equipe ao painel de publicações da RTM Advocacia.'],
]) {
  await mkdir(resolve(dist, directory), { recursive: true });
  let page = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  page = page.replace(/(<meta name="description" content=")[^"]*("\s*\/?>)/, `$1${description}$2`);
  page = page.replace(/(<meta property="og:title" content=")[^"]*("\s*\/?>)/, `$1${title}$2`);
  await writeFile(resolve(dist, directory, 'index.html'), page);
}
await mkdir(resolve(dist, 'api'), { recursive: true });
for (const file of ['blog.php', 'blog-core.php']) {
  await copyFile(resolve('server/blog', file), resolve(dist, 'api', file));
}
await copyFile(resolve('server/blog/blog-install.php.example'), resolve(dist, 'api/blog-install.php'));
console.log('Páginas /blog/ e /painel/ e API PHP preparadas.');
