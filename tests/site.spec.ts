import { test, expect } from '@playwright/test';
import type { AxeResults } from 'axe-core';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('loads revised content and valid section links without runtime errors or overflow', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Orientação jurídica para decisões que envolvem seus direitos, seu patrimônio e sua profissão.');
  expect(await page.locator('main section[id]').evaluateAll(sections => sections.map(section => section.id))).toEqual([
    'inicio', 'escritorio', 'atuacao', 'forma-atuacao', 'equipe', 'publicacoes', 'duvidas', 'contato',
  ]);
  await expect.poll(() => page.locator('.hero-visual img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  const brokenAnchors = await page.locator('a[href^="#"]').evaluateAll(links => links.filter(link => !document.getElementById(link.getAttribute('href')!.slice(1))).length);
  expect(brokenAnchors).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('editorial photographs load after scrolling and provide responsive sources', async ({ page }) => {
  const photos = page.locator('.hero-visual img, .editorial-photo img, .about-inset img, .practice-visual-card > img, .interlude-photo img, .insight-art img');
  await expect(photos).toHaveCount(12);
  for (const photo of await photos.all()) {
    await photo.scrollIntoViewIfNeeded();
    await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(photo).toHaveAttribute('srcset', /(?:640|800)w,.*(?:1000|1200|1600)w/);
    expect(await photo.getAttribute('width')).toBeTruthy();
    expect(await photo.getAttribute('height')).toBeTruthy();
  }
  const sources = await photos.evaluateAll(images => images.map(image => image.getAttribute('src') || ''));
  for (const name of ['legal-specialties-hero', 'office-editorial', 'civil-editorial', 'health-editorial', 'property-editorial', 'consultation-editorial']) {
    expect(sources.some(source => source.includes(name))).toBe(true);
  }
  expect(sources.some(source => source.includes('architecture'))).toBe(false);
});

test('the immersive hero photograph fills the banner across the viewport', async ({ page }) => {
  const hero = page.locator('.hero.hero-immersive');
  // Entrance effects must settle before measuring the displayed photo bounds.
  await hero.evaluate(async element => {
    await Promise.all(element.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => undefined)));
  });
  const banner = await hero.boundingBox();
  const visual = await hero.locator('.hero-visual').boundingBox();
  const photo = await hero.locator('img').boundingBox();
  expect(banner).not.toBeNull();
  expect(visual).not.toBeNull();
  expect(photo).not.toBeNull();
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  expect(Math.abs(banner!.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(banner!.width - viewportWidth)).toBeLessThanOrEqual(1);
  for (const box of [visual!, photo!]) {
    expect(Math.abs(box.x - banner!.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.y - banner!.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.width - banner!.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.height - banner!.height)).toBeLessThanOrEqual(1);
  }
  await expect(hero.locator('img')).toHaveAttribute('src', /legal-specialties-hero-1600\.webp$/);
  await expect(hero.locator('img')).toHaveAttribute('sizes', '100vw');
});

test('each photographic service card opens its matching accordion', async ({ page }) => {
  const cards = page.locator('.practice-visual-card');
  await expect(cards).toHaveCount(3);
  for (const [index, id, name] of [
    [0, 'civil', 'Direito Civil'],
    [1, 'consumidor', 'Direito do Consumidor'],
    [2, 'medico', 'Direito Médico'],
  ] as const) {
    await expect(cards.nth(index)).toContainText(name);
    await cards.nth(index).click();
    await expect(page.locator(`#trigger-${id}`)).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(`#details-${id}`)).toBeVisible();
    await expect(page.locator('.practice-item button[aria-expanded="true"]')).toHaveCount(1);
  }
});

test('WhatsApp stays visible after scrolling and opens the confirmed contact without an external request', async ({ page, context }) => {
  const message = 'Olá! Gostaria de informações sobre o atendimento da RTM Advocacia.';
  const expectedHref = `https://wa.me/5531991967003?text=${encodeURIComponent(message)}`;
  const automaticRequests: string[] = [];
  const interceptedRequests: string[] = [];
  page.on('request', request => {
    if (new URL(request.url()).hostname === 'wa.me') automaticRequests.push(request.url());
  });
  await page.reload();
  const floating = page.getByRole('link', { name: 'WhatsApp — fale com o escritório (abre em nova aba)', exact: true });
  await expect(floating).toHaveAttribute('href', expectedHref);
  await expect(floating).toHaveAttribute('target', '_blank');
  await expect(floating).toHaveAttribute('rel', /\bnoopener\b/);
  await expect(floating).toHaveAttribute('rel', /\bnoreferrer\b/);
  await expect(page.getByRole('link', { name: 'Fale pelo WhatsApp', exact: true })).toHaveAttribute('href', expectedHref);
  await page.locator('#publicacoes').scrollIntoViewIfNeeded();
  await expect(floating).toBeVisible();
  expect(await floating.evaluate(element => getComputedStyle(element).position)).toBe('fixed');
  const box = await floating.boundingBox();
  const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
  expect(automaticRequests).toEqual([]);
  // Fulfill the destination inside the test; no request reaches WhatsApp.
  await context.route('https://wa.me/**', async route => {
    interceptedRequests.push(route.request().url());
    await route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>WhatsApp test destination</title>' });
  });
  const [popup] = await Promise.all([context.waitForEvent('page'), floating.click()]);
  await popup.waitForLoadState('domcontentloaded');
  await expect(popup).toHaveTitle('WhatsApp test destination');
  const destination = new URL(popup.url());
  expect(destination.pathname).toBe('/5531991967003');
  expect(destination.searchParams.get('text')).toBe(message);
  expect(interceptedRequests).toEqual([expectedHref]);
  await popup.close();
});

test('practice areas expand, show the revised services and open their detail dialogs', async ({ page }) => {
  for (const [id, service, title] of [
    ['civil', 'Inventários e partilhas', 'Assessoria jurídica em questões patrimoniais, sucessórias e contratuais.'],
    ['consumidor', 'Questões envolvendo planos de saúde', 'Atuação jurídica nas relações de consumo.'],
    ['medico', 'Defesa de profissionais da saúde', 'Assessoria e defesa jurídica de profissionais da saúde.'],
  ]) {
    const button = page.locator(`#trigger-${id}`);
    const details = page.locator(`#details-${id}`);
    if (await button.getAttribute('aria-expanded') === 'false') await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(details).toContainText(service);
    await details.getByRole('button', { name: /Saiba mais/ }).click();
    await expect(page.getByRole('dialog').getByRole('heading', { level: 2 })).toHaveText(title);
    await expect(page.getByRole('dialog').locator('.service-details')).toContainText(service === 'Questões envolvendo planos de saúde' ? 'Planos de saúde' : service);
    await page.keyboard.press('Escape');
    await expect(details.getByRole('button', { name: /Saiba mais/ })).toBeFocused();
    await button.click();
    await expect(details).toBeHidden();
  }
});

test('the four team members have photo placeholders and accessible individual profiles', async ({ page }) => {
  const cards = page.locator('.team-card');
  await expect(cards).toHaveCount(4);
  await expect(page.locator('.team-portrait img')).toHaveCount(0);
  await expect(page.locator('.portrait-note')).toHaveText(Array(4).fill('FOTOGRAFIA EM BREVE'));
  for (const [index, name] of ['Dr. Welson', 'Dr. Rommel', 'Dr. Osvaldo', 'Dr. Wesley'].entries()) {
    await cards.nth(index).click();
    await expect(page.getByRole('dialog').getByRole('heading', { level: 2 })).toHaveText(name);
    await expect(page.getByRole('dialog')).toContainText('registro na OAB');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(cards.nth(index)).toBeFocused();
  }
});

test('publication filters show the correct topic counts, labels and selection states', async ({ page }) => {
  const filters = page.getByRole('group', { name: 'Filtrar publicações por área' });
  await expect(page.locator('.insight-card')).toHaveCount(5);
  for (const [name, count, label] of [
    ['Direito Civil', 3, 'DIREITO CIVIL'],
    ['Consumidor', 1, 'DIREITO DO CONSUMIDOR'],
    ['Direito Médico', 1, 'DIREITO MÉDICO'],
  ] as const) {
    const filter = filters.getByRole('button', { name, exact: true });
    await filter.click();
    await expect(filter).toHaveAttribute('aria-pressed', 'true');
    await expect(filters.locator('[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator('.insight-card')).toHaveCount(count);
    await expect(page.locator('.insight-body > .eyebrow')).toHaveText(Array(count).fill(label));
    await expect(page.locator('.result-count')).toHaveText(`${count} ${count === 1 ? 'conteúdo' : 'conteúdos'}`);
  }
  await filters.getByRole('button', { name: 'Todos os temas' }).click();
  await expect(page.locator('.insight-card')).toHaveCount(5);
});

test('each suggested publication opens its own preparation notice and contact disclosure works', async ({ page }) => {
  const cards = page.locator('.insight-card');
  await expect(cards).toHaveCount(5);
  for (let index = 0; index < 5; index++) {
    const card = cards.nth(index);
    const title = await card.locator('h3').innerText();
    await expect(card).toContainText('PAUTA EM PREPARAÇÃO');
    await card.click();
    await expect(page.getByRole('dialog').getByRole('heading', { level: 2 })).toHaveText(title);
    await expect(page.getByRole('dialog')).toContainText('O artigo completo ainda está em preparação');
    await page.getByRole('button', { name: 'Fechar janela' }).click();
  }
  const contact = page.getByRole('button', { name: 'Informações de atendimento', exact: true });
  await contact.click();
  await expect(contact).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#contact-information')).toContainText('E-mail, endereço e horários de atendimento ainda precisam ser confirmados');
  await expect(page.locator('#contact-information')).toBeVisible();
  await contact.click();
  await expect(page.locator('#contact-information')).toBeHidden();
});

test('navigation follows the team section and the mobile menu closes correctly', async ({ page }) => {
  const toggle = page.locator('#menu-toggle');
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    await toggle.click();
  }
  await page.getByRole('navigation').getByRole('link', { name: 'Equipe', exact: true }).click();
  await expect(page).toHaveURL(/#equipe$/);
  if (await toggle.isVisible()) await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('the six FAQs can be expanded and collapsed using the keyboard', async ({ page }) => {
  const questions = page.locator('.faq-item');
  await expect(questions).toHaveCount(6);
  for (const question of await questions.all()) {
    const summary = question.locator('summary');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(question).toHaveAttribute('open', '');
    await expect(question.locator('p')).toBeVisible();
    await page.keyboard.press('Space');
    await expect(question).not.toHaveAttribute('open');
    await expect(question.locator('p')).toBeHidden();
  }
});

test('reduced-motion preference keeps all content available without running animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  for (const section of await page.locator('main section[id]').all()) {
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading').first()).toBeVisible();
    expect(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
  }
  const hiddenContent = await page.locator('[data-reveal]').evaluateAll(elements => elements.filter(element => {
    const style = getComputedStyle(element);
    return style.opacity !== '1' || style.visibility !== 'visible' || style.display === 'none';
  }).length);
  expect(hiddenContent).toBe(0);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
});

test('automated WCAG checks pass on page and legal dialogs without cookies or local storage', async ({ page }) => {
  await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
  const scan = async () => {
    // Measure the settled text colors after finite entrance animations finish.
    await page.evaluate(async () => {
      await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => undefined)));
    });
    return page.evaluate(async () => {
      const axe = (window as unknown as { axe: { run: (context: Document, options: object) => Promise<AxeResults> } }).axe;
      return (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }));
    });
  };
  expect(await scan()).toEqual([]);
  await page.getByRole('button', { name: 'Privacidade e proteção de dados' }).click();
  await expect(page.getByRole('dialog')).toContainText('não utiliza cookies');
  expect(await scan()).toEqual([]);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Termos de uso', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('A consulta ao site não constitui contratação');
  expect(await scan()).toEqual([]);
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => ({ cookies: document.cookie, localStorage: localStorage.length }))).toEqual({ cookies: '', localStorage: 0 });
});
