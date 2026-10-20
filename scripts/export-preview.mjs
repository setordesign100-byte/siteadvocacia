import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const dist = resolve('dist');
const mime = { woff2: 'font/woff2', woff: 'font/woff', webp: 'image/webp', svg: 'image/svg+xml' };
async function dataUrl(path) {
  const extension = path.split('.').pop();
  if (!mime[extension]) throw new Error(`Unsupported preview asset: ${path}`);
  const file = await readFile(resolve(dist, path.replace(/^\//, '')));
  return `data:${mime[extension]};base64,${file.toString('base64')}`;
}

let html = await readFile(resolve(dist, 'index.html'), 'utf8');
const scriptTag = html.match(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/);
const styleTag = html.match(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);
if (!scriptTag || !styleTag) throw new Error('Build must contain a single JS and CSS entry.');
let js = await readFile(resolve(dist, scriptTag[1].replace(/^\//, '')), 'utf8');
let css = await readFile(resolve(dist, styleTag[1].replace(/^\//, '')), 'utf8');

for (const path of new Set([...css.matchAll(/url\((\/assets\/[^)]+)\)/g)].map(match => match[1]))) {
  css = css.replaceAll(`url(${path})`, `url("${await dataUrl(path)}")`);
}
for (const path of new Set([...js.matchAll(/\/images\/[\w.-]+\.webp/g)].map(match => match[0]))) {
  js = js.replaceAll(path, await dataUrl(path));
}
html = html.replace(scriptTag[0], '');
html = html.replace(styleTag[0], () => `<style>${css.replaceAll('</style', '<\\/style')}</style>`);
html = html.replace('/favicon.svg', await dataUrl('/favicon.svg'));
html = html.replace('</body>', () => `<script type="module">${js.replaceAll('</script', '<\\/script')}</script></body>`);
html = html.replace(/[ \t]+$/gm, '');
const output = resolve(dist, 'rtm-preview.html');
await writeFile(output, html);
await writeFile(resolve('ABRA-A-PREVIA.html'), html);
console.log(`Prévia independente criada: ${output} (${Math.round(Buffer.byteLength(html) / 1024)} KB)`);
