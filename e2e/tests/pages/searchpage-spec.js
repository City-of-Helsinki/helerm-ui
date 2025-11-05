import { expect, test } from '@playwright/test';

import { acceptCookieConsent } from '../utils.js';

test.describe('Search page', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');
    await acceptCookieConsent(page);
  });

  // Haku / Sisältöhaku
  test('Search view', async () => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Haku' }).click();
    await page.getByRole('button', { name: '?' }).first().click();
    await expect(page.getByRole('heading', { name: 'Hakuohje' })).toBeVisible();
    await expect(page.locator('.faceted-search-loader > .fa-solid')).toBeVisible();
    await expect(page.locator('.faceted-search-loader > .fa-solid')).not.toBeVisible({ timeout: 30000 });
    await page.getByPlaceholder('Vapaasanahaku').fill('varastosiirron');
    await expect(page.getByText('Käsittelyvaihe (1)')).toBeVisible();
    await page.getByRole('button', { name: 'Hae' }).click();
    await expect(page.getByText('Lisätietoja: Ajoneuvon')).toBeVisible();
    await expect(page.getByText('Hakutulokset (1)')).toBeVisible();
    await page
      .locator('div')
      .filter({ hasText: /^Vie hakutulokset Exceliin \(1\)$/ })
      .nth(3)
      .click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByText('Yhdelle välilehdelle', { exact: true }).click();
    await downloadPromise;
  });

  test.afterAll(async () => {
    await page.close();
  });
});
