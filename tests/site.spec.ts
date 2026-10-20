import { test, expect } from '@playwright/test';
import type { AxeResults } from 'axe-core';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('loads complete content, local assets and valid section links without overflow', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Clareza para decidir.');
  await expect(page.locator('main section[id]')).toHaveCount(6);
  expect(await page.locator('.hero-visual img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  const brokenAnchors = await page.locator('a[href^="#"]').evaluateAll(links => links.filter(link => !document.getElementById(link.getAttribute('href')!.slice(1))).length);
  expect(brokenAnchors).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('practice areas expand and collapse with matching accessible states', async ({ page }) => {
  for (const [id, text] of [['civil', 'Inventários e sucessões'], ['consumidor', 'Questões envolvendo planos de saúde'], ['medico', 'Defesa de profissionais da saúde']]) {
    const button = page.locator(`#trigger-${id}`);
    if (await button.getAttribute('aria-expanded') === 'false') await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(`#details-${id}`)).toContainText(text);
    await button.click();
    await expect(page.locator(`#details-${id}`)).toBeHidden();
  }
});

test('each professional opens the correct profile and returns focus on escape', async ({ page }) => {
  const cards = page.locator('.team-card');
  for (let index = 0; index < 4; index++) {
    await cards.nth(index).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog')).toContainText('registro na OAB');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(cards.nth(index)).toBeFocused();
  }
});

test('editorial cards open their own content and the contact notice works', async ({ page }) => {
  for (let index = 0; index < 3; index++) {
    const card = page.locator('.insight-card').nth(index);
    const title = await card.locator('h3').innerText();
    await card.click();
    await expect(page.getByRole('dialog').getByRole('heading')).toHaveText(title);
    await page.getByRole('button', { name: 'Fechar janela' }).click();
  }
  await page.getByRole('button', { name: 'Informações de atendimento', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('ainda precisam ser confirmados');
});

test('mobile navigation opens, follows a section and closes', async ({ page }) => {
  const toggle = page.locator('#menu-toggle');
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  }
  await page.getByRole('navigation').getByRole('link', { name: 'Nossa equipe' }).click();
  await expect(page).toHaveURL(/#equipe$/);
  if (await toggle.isVisible()) await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('WCAG automated checks pass on page and privacy dialog', async ({ page }) => {
  await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
  const scan = async () => page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run: (context: Document, options: object) => Promise<AxeResults> } }).axe;
    return (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }));
  });
  expect(await scan()).toEqual([]);
  await page.getByRole('button', { name: 'Privacidade e proteção de dados' }).click();
  await expect(page.getByRole('dialog')).toContainText('não utiliza cookies');
  expect(await scan()).toEqual([]);
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => ({ cookies: document.cookie, localStorage: localStorage.length }))).toEqual({ cookies: '', localStorage: 0 });
});
