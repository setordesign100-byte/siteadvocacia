import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const legacyActivationCode = 'RTM-BLOG-INTEGRATION-TEST-ACTIVATION-ONLY';
const username = 'admin.rtm';
const password = 'UmaSenhaParaTestes-2026!';
const endpoint = '/api/blog.php?action=';
const origin = 'http://127.0.0.1:4180';

type Session = { authenticated: boolean; setupRequired: boolean; setupConfigured: boolean; csrfToken: string; username?: string; role?: 'admin' | 'editor' };
type AuthorizedUser = { id: string; username: string; role: 'admin' | 'editor'; createdAt: string };
type SavedPost = { id: string; slug: string; status: 'draft' | 'published'; updatedAt: string };

async function apiAccess(request: APIRequestContext, login = username, loginPassword = password): Promise<Session> {
  const current = await request.get(`${endpoint}session`);
  expect(current.ok()).toBe(true);
  const session: Session = await current.json();
  expect(session.setupConfigured).toBe(true);
  expect(session.setupRequired).toBe(false);
  if (session.authenticated) return session;
  const response = await request.post(`${endpoint}login`, {
    headers: { 'X-CSRF-Token': session.csrfToken },
    data: { username: login, password: loginPassword },
  });
  expect(response.ok(), await response.text()).toBe(true);
  return response.json();
}

async function uiAccess(page: Page, login = username, loginPassword = password) {
  await page.goto('/painel/');
  await expect(page.getByLabel('Usuário', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Criar meu acesso', exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Código de ativação', { exact: true })).toHaveCount(0);
  await page.getByLabel('Usuário', { exact: true }).fill(login);
  await page.getByLabel('Senha', { exact: true }).fill(loginPassword);
  await page.getByRole('button', { name: 'Entrar no painel', exact: true }).click();
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

test('the API rejects public registration and protects editing, private data and uploaded image types', async ({ request, playwright }) => {
  const anonymous = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:4180' });
  const feed = await anonymous.get(`${endpoint}posts`);
  expect(feed.status()).toBe(200);
  expect(feed.headers()['set-cookie']).toBeUndefined();
  expect((await anonymous.get(`${endpoint}manage`)).status()).toBe(401);
  expect([401, 403]).toContain((await anonymous.post(`${endpoint}save`, { data: { title: 'Tentativa sem acesso' } })).status());
  for (const path of ['/rtm-blog-private/account.json', '/rtm-blog-private/users.json', '/api/users.json']) {
    const response = await anonymous.get(path);
    expect(response.status()).toBe(404);
    expect(await response.text()).not.toContain('passwordHash');
  }

  const session = await apiAccess(request);
  expect(session.role).toBe('admin');
  expect((await request.post(`${endpoint}save`, { data: { title: 'Tentativa sem token' } })).status()).toBe(403);
  const headers = { 'X-CSRF-Token': session.csrfToken };
  const anonymousSession: Session = await (await anonymous.get(`${endpoint}session`)).json();
  expect(anonymousSession.setupRequired).toBe(false);
  const selfRegistration = await anonymous.post(`${endpoint}create-user`, {
    headers: { 'X-CSRF-Token': anonymousSession.csrfToken }, data: { username: 'cadastro.publico', password },
  });
  expect([401, 403]).toContain(selfRegistration.status());
  for (const client of [anonymous, request]) {
    const disabledSetup = await client.post(`${endpoint}setup`, { headers, data: { activationCode: legacyActivationCode, username: 'outro.editor', password } });
    expect([403, 404]).toContain(disabledSetup.status());
  }
  const principalUsers = await request.get(`${endpoint}users`);
  expect(principalUsers.ok()).toBe(true);
  const principalBody = await principalUsers.text();
  expect(principalBody).not.toContain('passwordHash');
  expect(principalBody).not.toContain('credentialVersion');
  const principal = (JSON.parse(principalBody).users as AuthorizedUser[]).find(user => user.role === 'admin')!;
  expect(principal.username).toBe(username);
  expect((await request.post(`${endpoint}revoke-user`, { headers, data: { id: principal.id } })).status()).toBe(422);
  expect((await request.post(`${endpoint}create-user`, { headers, data: { username: 'outro.admin', password, role: 'admin' } })).status()).toBe(403);
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

test('only the principal authorizes editors, revocation closes their sessions and password changes invalidate other sessions', async ({ page, browser, request, playwright }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await uiAccess(page);
  const editorName = `editor.${testInfo.project.name}.${Date.now()}`;
  await page.getByRole('button', { name: 'Gerenciar acessos', exact: true }).click();
  const accessDialog = page.getByRole('dialog');
  await expect(accessDialog.getByRole('heading', { name: 'Acessos autorizados', exact: true })).toBeVisible();
  await accessDialog.getByLabel('Usuário do novo acesso', { exact: true }).fill(editorName);
  await accessDialog.getByLabel('Senha do novo acesso', { exact: true }).fill(password);
  await accessDialog.getByLabel('Confirmar senha do novo acesso', { exact: true }).fill(password);
  const createResponse = waitsForAction(page, 'create-user');
  await accessDialog.getByRole('button', { name: 'Criar acesso de editor', exact: true }).click();
  const editor = (await (await createResponse).json()).user as AuthorizedUser;
  expect(editor.role).toBe('editor');
  expect(editor.username).toBe(editorName);
  await expect(accessDialog.getByRole('button', { name: `Revogar acesso de ${editorName}`, exact: true })).toBeVisible();

  const editorContext = await browser.newContext({ baseURL: origin, viewport: page.viewportSize() || undefined });
  const editorPage = await editorContext.newPage();
  await uiAccess(editorPage, editorName);
  await expect(editorPage.getByRole('button', { name: 'Gerenciar acessos', exact: true })).toHaveCount(0);
  const editorSession: Session = await (await editorContext.request.get(`${endpoint}session`)).json();
  expect(editorSession.role).toBe('editor');
  const editorHeaders = { 'X-CSRF-Token': editorSession.csrfToken };
  expect((await editorContext.request.get(`${endpoint}users`)).status()).toBe(403);
  for (const [action, data] of [
    ['create-user', { username: 'criacao.sem.permissao', password, role: 'admin' }],
    ['revoke-user', { id: editor.id }],
  ] as const) {
    expect((await editorContext.request.post(`${endpoint}${action}`, { headers: editorHeaders, data })).status()).toBe(403);
  }
  const upload = await editorContext.request.post(`${endpoint}upload`, {
    headers: editorHeaders,
    multipart: { file: { name: 'capa.webp', mimeType: 'image/webp', buffer: readFileSync(resolve('public/images/contracts-editorial-640.webp')) } },
  });
  expect(upload.ok()).toBe(true);
  const postResponse = await editorContext.request.post(`${endpoint}save`, {
    headers: editorHeaders,
    data: { title: `Artigo autorizado ${editorName}`, excerpt: 'Resumo criado no teste de acesso autorizado.', content: 'Publicação de exemplo usada para verificar que um editor autorizado consegue publicar conteúdo no blog.', category: 'civil', image: (await upload.json()).image, imageAlt: 'Documentos sobre uma mesa', author: 'Editor de teste', status: 'published' },
  });
  expect(postResponse.ok(), await postResponse.text()).toBe(true);
  const post = (await postResponse.json()).post as SavedPost;
  expect((await request.get(`${endpoint}post&slug=${encodeURIComponent(post.slug)}`)).ok()).toBe(true);
  await accessDialog.getByRole('button', { name: `Revogar acesso de ${editorName}`, exact: true }).click();
  const revokeResponse = waitsForAction(page, 'revoke-user');
  await accessDialog.getByRole('button', { name: 'Confirmar revogação', exact: true }).click();
  expect((await revokeResponse).ok()).toBe(true);
  await expect(accessDialog.getByRole('button', { name: `Revogar acesso de ${editorName}`, exact: true })).toHaveCount(0);
  expect((await editorContext.request.get(`${endpoint}manage`)).status()).toBe(401);
  const deniedSave = await editorContext.request.post(`${endpoint}save`, { headers: editorHeaders, data: { title: 'Sessão já revogada', status: 'draft' } });
  expect([401, 403]).toContain(deniedSave.status());
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await editorContext.close();

  const principalSession = await apiAccess(request);
  const principalHeaders = { 'X-CSRF-Token': principalSession.csrfToken };
  expect((await request.post(`${endpoint}delete`, { headers: principalHeaders, data: { id: post.id, updatedAt: post.updatedAt } })).ok()).toBe(true);
  const otherPrincipal = await playwright.request.newContext({ baseURL: origin });
  await apiAccess(otherPrincipal);
  const newPassword = 'OutraSenhaDeTeste-2026!';
  let changedSession: Session | undefined;
  try {
    const changed = await request.post(`${endpoint}change-password`, { headers: principalHeaders, data: { currentPassword: password, newPassword } });
    expect(changed.ok(), await changed.text()).toBe(true);
    changedSession = await changed.json();
    expect(changedSession!.role).toBe('admin');
    expect(changedSession!.csrfToken).not.toBe(principalSession.csrfToken);
    expect((await otherPrincipal.get(`${endpoint}manage`)).status()).toBe(401);
    const otherSession: Session = await (await otherPrincipal.get(`${endpoint}session`)).json();
    expect((await otherPrincipal.post(`${endpoint}login`, { headers: { 'X-CSRF-Token': otherSession.csrfToken }, data: { username, password } })).status()).toBe(401);
    const recovered = await apiAccess(otherPrincipal, username, newPassword);
    expect(recovered.role).toBe('admin');
  } finally {
    if (changedSession) {
      const restored = await request.post(`${endpoint}change-password`, { headers: { 'X-CSRF-Token': changedSession.csrfToken }, data: { currentPassword: newPassword, newPassword: password } });
      expect(restored.ok(), await restored.text()).toBe(true);
    }
    await otherPrincipal.dispose();
  }
});

test('a user can rename their own login without losing permissions or articles', async ({ page, request, playwright }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const renamedLogin = `principal.${testInfo.project.name}.${Date.now()}`;
  const editorName = `renomear.editor.${testInfo.project.name}.${Date.now()}`;
  const anonymous = await playwright.request.newContext({ baseURL: origin });
  const otherPrincipal = await playwright.request.newContext({ baseURL: origin });
  const editorClient = await playwright.request.newContext({ baseURL: origin });
  let editor: AuthorizedUser | undefined;
  let draft: SavedPost | undefined;

  try {
    const principalSession = await apiAccess(request);
    const headers = { 'X-CSRF-Token': principalSession.csrfToken };
    const createdEditor = await request.post(`${endpoint}create-user`, { headers, data: { username: editorName, password } });
    expect(createdEditor.ok(), await createdEditor.text()).toBe(true);
    editor = (await createdEditor.json()).user;
    const createdDraft = await request.post(`${endpoint}save`, { headers, data: { title: `Rascunho preservado ${renamedLogin}`, status: 'draft' } });
    expect(createdDraft.ok(), await createdDraft.text()).toBe(true);
    draft = (await createdDraft.json()).post;
    const articlesBefore = (await (await request.get(`${endpoint}manage`)).json()).posts;

    const anonymousSession: Session = await (await anonymous.get(`${endpoint}session`)).json();
    const deniedRename = await anonymous.post(`${endpoint}change-username`, {
      headers: { 'X-CSRF-Token': anonymousSession.csrfToken }, data: { currentPassword: password, newUsername: renamedLogin },
    });
    expect([401, 403]).toContain(deniedRename.status());
    expect((await request.post(`${endpoint}change-username`, { headers, data: { currentPassword: 'SenhaIncorreta-2026!', newUsername: renamedLogin } })).status()).toBe(422);
    expect((await request.post(`${endpoint}change-username`, { headers, data: { currentPassword: password, newUsername: editorName } })).status()).toBe(409);

    await apiAccess(otherPrincipal);
    await uiAccess(page);
    await page.getByRole('button', { name: 'Alterar meu usuário', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Alterar meu usuário', exact: true })).toBeVisible();
    await expect(dialog.getByLabel('Novo usuário', { exact: true })).toHaveValue(username);
    await dialog.getByLabel('Novo usuário', { exact: true }).fill(renamedLogin);
    await dialog.getByLabel('Senha atual', { exact: true }).fill(password);
    const renameResponse = waitsForAction(page, 'change-username');
    await dialog.getByRole('button', { name: 'Salvar novo usuário', exact: true }).click();
    const renamed = await renameResponse;
    expect(renamed.ok(), await renamed.text()).toBe(true);
    const renamedSession: Session = await renamed.json();
    expect(renamedSession.username).toBe(renamedLogin);
    expect(renamedSession.role).toBe('admin');
    await expect(dialog.getByText('Usuário alterado. No próximo acesso, use o novo usuário com a mesma senha.', { exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Salvar novo usuário', exact: true })).toBeEnabled();
    await page.keyboard.press('Escape');
    await expect(page.locator('.blog-admin-top')).toContainText(renamedLogin);
    const currentSession: Session = await (await page.request.get(`${endpoint}session`)).json();
    expect(currentSession.csrfToken).toBe(renamedSession.csrfToken);
    expect(currentSession.role).toBe('admin');
    const articlesAfter = (await (await page.request.get(`${endpoint}manage`)).json()).posts;
    expect(articlesAfter).toEqual(articlesBefore);
    expect(articlesAfter.some((post: SavedPost) => post.id === draft!.id)).toBe(true);

    expect((await otherPrincipal.get(`${endpoint}manage`)).status()).toBe(401);
    const expiredSession: Session = await (await otherPrincipal.get(`${endpoint}session`)).json();
    expect((await otherPrincipal.post(`${endpoint}login`, {
      headers: { 'X-CSRF-Token': expiredSession.csrfToken }, data: { username, password },
    })).status()).toBe(401);
    // A fresh request initializes the same delivery again; it must preserve the
    // renamed principal rather than restore the username from its install file.
    const loggedInAgain = await apiAccess(otherPrincipal, renamedLogin);
    expect(loggedInAgain.username).toBe(renamedLogin);
    expect(loggedInAgain.role).toBe('admin');

    const editorSession = await apiAccess(editorClient, editorName);
    expect(editorSession.role).toBe('editor');
    const editorHeaders = { 'X-CSRF-Token': editorSession.csrfToken };
    expect((await editorClient.post(`${endpoint}change-username`, {
      headers: editorHeaders, data: { currentPassword: password, newUsername: username },
    })).status()).toBe(403);
    const newEditorName = `editor.alterado.${testInfo.project.name}.${Date.now()}`;
    const editorRename = await editorClient.post(`${endpoint}change-username`, {
      headers: editorHeaders, data: { currentPassword: password, newUsername: newEditorName },
    });
    expect(editorRename.ok(), await editorRename.text()).toBe(true);
    const changedEditor: Session = await editorRename.json();
    expect(changedEditor.username).toBe(newEditorName);
    expect(changedEditor.role).toBe('editor');
    expect((await editorClient.get(`${endpoint}users`)).status()).toBe(403);
    expect((await page.request.post(`${endpoint}create-user`, {
      headers: { 'X-CSRF-Token': currentSession.csrfToken }, data: { username, password },
    })).status()).toBe(403);
  } finally {
    const cleanup = await playwright.request.newContext({ baseURL: origin });
    try {
      let cleanupSession: Session | undefined;
      for (const candidate of [renamedLogin, username]) {
        try { cleanupSession = await apiAccess(cleanup, candidate); break; } catch { /* Try the unchanged name if the UI action did not finish. */ }
      }
      expect(cleanupSession).toBeDefined();
      if (cleanupSession!.username !== username) {
        const restored = await cleanup.post(`${endpoint}change-username`, {
          headers: { 'X-CSRF-Token': cleanupSession!.csrfToken }, data: { currentPassword: password, newUsername: username },
        });
        expect(restored.ok(), await restored.text()).toBe(true);
        cleanupSession = await restored.json();
      }
      const headers = { 'X-CSRF-Token': cleanupSession!.csrfToken };
      if (editor) expect((await cleanup.post(`${endpoint}revoke-user`, { headers, data: { id: editor.id } })).ok()).toBe(true);
      if (draft) expect((await cleanup.post(`${endpoint}delete`, { headers, data: { id: draft.id, updatedAt: draft.updatedAt } })).ok()).toBe(true);
    } finally {
      await cleanup.dispose();
      await anonymous.dispose();
      await otherPrincipal.dispose();
      await editorClient.dispose();
    }
  }
});
