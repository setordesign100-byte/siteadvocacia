import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import { resolve } from 'node:path';

const activationCode = 'RTM-BLOG-INTEGRATION-TEST-ACTIVATION-ONLY';
const username = 'editor.teste';
const password = 'UmaSenhaParaTestes-2026!';
const endpoint = '/api/blog.php?action=';

type Session = { authenticated: boolean; setupRequired: boolean; setupConfigured: boolean; csrfToken: string };
type SavedPost = { id: string; slug: string; status: 'draft' | 'published'; updatedAt: string };

async function apiAccess(request: APIRequestContext): Promise<Session> {
  const current = await request.get(`${endpoint}session`);
  expect(current.ok()).toBe(true);
  const session: Session = await current.json();
  expect(session.setupConfigured).toBe(true);
  if (session.authenticated) return session;
  const action = session.setupRequired ? 'setup' : 'login';
  const response = await request.post(`${endpoint}${action}`, {
    headers: { 'X-CSRF-Token': session.csrfToken },
    data: { username, password, ...(session.setupRequired ? { activationCode } : {}) },
  });
  expect(response.ok(), await response.text()).toBe(true);
  return response.json();
}

async function uiAccess(page: Page) {
  await page.goto('/painel/');
  await expect(page.getByLabel('Usuário', { exact: true })).toBeVisible();
  const setup = page.getByRole('button', { name: 'Criar meu acesso', exact: true });
  const creating = await setup.isVisible();
  if (creating) await page.getByLabel('Código de ativação', { exact: true }).fill(activationCode);
  await page.getByLabel('Usuário', { exact: true }).fill(username);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  if (creating) await page.getByLabel('Confirmar senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: creating ? 'Criar meu acesso' : 'Entrar no painel', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Novo artigo', exact: true })).toBeVisible();
}

function waitsForAction(page: Page, action: string) {
  return page.waitForResponse(response => {
    const url = new URL(response.url());
    return url.pathname === '/api/blog.php' && url.searchParams.get('action') === action && response.request().method() === 'POST';
  });
}

test('an editor creates a draft, previews, publishes, updates and removes a real article', async ({ page, browser }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const title = `Publicação de teste ${testInfo.project.name} ${Date.now()}`;
  const literalScript = '<script>window.__blogXss = true</script>';
  const text = `Este conteúdo foi preparado para conferir a publicação real do blog.\n\n${literalScript}\n\nO texto permanece como conteúdo informativo, com parágrafos e leitura adequada.`;
  const imageAlt = 'Documentos usados para ilustrar esta publicação de teste';
  await uiAccess(page);
  await page.getByRole('button', { name: 'Novo artigo', exact: true }).click();
  await page.getByLabel('Título do artigo', { exact: true }).fill(title);
  await page.getByLabel('Categoria', { exact: true }).selectOption('civil');
  await page.getByLabel(/^Resumo/).fill('Resumo da publicação criada pelos testes do painel do blog.');
  await page.getByLabel('Autoria', { exact: true }).fill('RTM Advocacia');
  const uploaded = waitsForAction(page, 'upload');
  await page.getByLabel('Escolher imagem', { exact: true }).setInputFiles(resolve('public/images/contracts-editorial-640.webp'));
  expect((await uploaded).ok()).toBe(true);
  await page.getByLabel(/^Descrição da imagem/).fill(imageAlt);
  await page.getByLabel(/^Texto do artigo/).fill(text);
  await page.getByRole('button', { name: 'Ver prévia', exact: true }).click();
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await expect(page.getByText(literalScript, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __blogXss?: boolean }).__blogXss)).toBeUndefined();
  await page.getByRole('button', { name: 'Continuar editando', exact: true }).click();

  const draftResponse = waitsForAction(page, 'save');
  await page.getByRole('button', { name: 'Salvar rascunho', exact: true }).click();
  const draft: SavedPost = (await (await draftResponse).json()).post;
  expect(draft.status).toBe('draft');
  await expect(page.getByRole('button', { name: `Editar ${title}`, exact: true })).toBeVisible();

  const visitor = await browser.newContext();
  const visitorPage = await visitor.newPage();
  const draftRead = await visitor.request.get(`http://127.0.0.1:4180${endpoint}post&slug=${encodeURIComponent(draft.slug)}`);
  expect(draftRead.status()).toBe(404);
  const publishedResponse = waitsForAction(page, 'save');
  await page.getByRole('button', { name: 'Publicar artigo', exact: true }).click();
  const published: SavedPost = (await (await publishedResponse).json()).post;
  expect(published.status).toBe('published');

  const articleUrl = `http://127.0.0.1:4180/blog/?artigo=${encodeURIComponent(published.slug)}`;
  await visitorPage.goto(articleUrl);
  await expect(visitorPage.getByRole('heading', { level: 1 })).toHaveText(title);
  await expect(visitorPage.getByText(literalScript, { exact: true })).toBeVisible();
  const articleImage = visitorPage.getByRole('img', { name: imageAlt, exact: true });
  await expect.poll(() => articleImage.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  expect(await visitorPage.evaluate(() => (window as unknown as { __blogXss?: boolean }).__blogXss)).toBeUndefined();
  expect(await visitorPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  await visitorPage.reload();
  await expect(visitorPage.getByRole('heading', { level: 1 })).toHaveText(title);

  await page.reload();
  await page.getByRole('button', { name: `Editar ${title}`, exact: true }).click();
  await expect(page.getByLabel('Título do artigo', { exact: true })).toHaveValue(title);
  await expect(page.getByLabel(/^Texto do artigo/)).toHaveValue(text);
  const revisedText = `${text}\n\nParágrafo acrescentado após a primeira publicação.`;
  await page.getByLabel(/^Texto do artigo/).fill(revisedText);
  const updatedResponse = waitsForAction(page, 'save');
  await page.getByRole('button', { name: 'Atualizar publicação', exact: true }).click();
  const updated: SavedPost = (await (await updatedResponse).json()).post;
  expect(updated.slug).toBe(published.slug);
  await visitorPage.reload();
  await expect(visitorPage.getByText('Parágrafo acrescentado após a primeira publicação.', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Voltar para rascunho', exact: true }).click();
  const unpublishedResponse = waitsForAction(page, 'save');
  await page.getByRole('dialog').getByRole('button', { name: 'Retirar do blog', exact: true }).click();
  expect((await (await unpublishedResponse).json()).post.status).toBe('draft');
  expect((await visitor.request.get(`http://127.0.0.1:4180${endpoint}post&slug=${encodeURIComponent(published.slug)}`)).status()).toBe(404);
  await visitorPage.reload();
  await expect(visitorPage.getByRole('heading', { name: title, exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Excluir artigo', exact: true }).click();
  const deletedResponse = waitsForAction(page, 'delete');
  await page.getByRole('dialog').getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
  expect((await deletedResponse).ok()).toBe(true);
  await expect(page.getByRole('button', { name: `Editar ${title}`, exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Entrar no painel', exact: true })).toBeVisible();
  await visitor.close();
});

test('the API protects editing, setup, private data and uploaded image types', async ({ request, playwright }) => {
  const anonymous = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:4180' });
  const feed = await anonymous.get(`${endpoint}posts`);
  expect(feed.status()).toBe(200);
  expect(feed.headers()['set-cookie']).toBeUndefined();
  expect((await anonymous.get(`${endpoint}manage`)).status()).toBe(401);
  expect([401, 403]).toContain((await anonymous.post(`${endpoint}save`, { data: { title: 'Tentativa sem acesso' } })).status());
  for (const path of ['/rtm-blog-private/account.json', '/api/account.json']) {
    const response = await anonymous.get(path);
    expect(response.status()).toBe(404);
    expect(await response.text()).not.toContain('passwordHash');
  }

  const session = await apiAccess(request);
  expect((await request.post(`${endpoint}save`, { data: { title: 'Tentativa sem token' } })).status()).toBe(403);
  const headers = { 'X-CSRF-Token': session.csrfToken };
  const repeatedSetup = await request.post(`${endpoint}setup`, { headers, data: { activationCode, username: 'outro.editor', password } });
  expect([403, 409]).toContain(repeatedSetup.status());
  const svg = await request.post(`${endpoint}upload`, {
    headers,
    multipart: { file: { name: 'imagem.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>') } },
  });
  expect([400, 415, 422]).toContain(svg.status());
  const falseImage = await request.post(`${endpoint}upload`, {
    headers,
    multipart: { file: { name: 'imagem.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('<?php echo "not an image"; ?>') } },
  });
  expect([400, 415, 422]).toContain(falseImage.status());
  await anonymous.dispose();
});
