import { expect, test } from '@playwright/test';

import { acceptCookieConsent } from '../utils.js';

test.describe('Frontpage', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');
    await acceptCookieConsent(page);
  });

  test.beforeEach(async () => {
    await page.waitForLoadState('networkidle');

    // Wait for navigation data to load by checking for any navigation button
    try {
      await page.waitForSelector('button[class*="infinity-menu"]', { timeout: 10000 });
    } catch {
      // If no navigation buttons are found, wait a bit more
      await page.waitForTimeout(2000);
    }
  });

  test('title', async () => {
    const pageTitle = await page.title();
    expect(pageTitle).toContain('Tiedonohjaus');
  });

  test('Open links', async () => {
    await page.getByRole('button', { name: '14 Elinkeino- ja työvoimapalvelut' }).click();
    await page.getByRole('button', { name: '13 Tilastointi-, tutkimus- ja' }).click();
    await page.getByRole('button', { name: 'Opetus- ja sivistystoimi  +' }).click();
    await page.getByRole('button', { name: 'Ympäristöasiat  +' }).click();
    await page.getByRole('button', { name: '10 Maankäyttö, rakentaminen' }).click();
    await page.getByRole('button', { name: '09 Turvallisuus ja yleinen jä' }).click();
    await page.getByRole('button', { name: 'Liikenne  +' }).click();
    await page.getByRole('button', { name: 'Tiedon hallinta  +' }).click();
    await page.getByRole('button', { name: '06 Terveydenhuolto  +' }).click();
    await page.getByRole('button', { name: 'Sosiaalitoimi  +' }).click();
    await page.getByRole('button', { name: '04 Kansainvälinen toiminta ja' }).click();
    await page.getByRole('button', { name: '03 Lainsäädäntö ja lainsäädä' }).click();
    await page.getByRole('button', { name: '02 Talousasiat, verotus ja' }).click();
    await page.getByRole('button', { name: 'Henkilöstöasiat  +' }).click();
    await page.getByRole('button', { name: 'Hallintoasiat  +' }).click();
  });

  test('Filter', async () => {
    // Wait for navigation elements to load
    await page.waitForSelector('button', { timeout: 15000 });

    // Look for buttons that contain "Hallintoasiat" or "Liikenne"
    const hallintoButton = page
      .locator('button')
      .filter({ hasText: /Hallintoasiat/i })
      .first();
    const liikenneButton = page
      .locator('button')
      .filter({ hasText: /Liikenne/i })
      .first();

    await expect(page.getByText('12 02 02 02')).not.toBeVisible();
    await expect(hallintoButton).toBeVisible();
    await expect(liikenneButton).toBeVisible();
    await page.getByPlaceholder('Etsi...').click();
    await page.getByPlaceholder('Etsi...').fill('kirjastoasiakkuuden');
    await expect(page.getByText('12 02 02 02')).toBeVisible();
    await expect(hallintoButton).not.toBeVisible();
    await expect(liikenneButton).not.toBeVisible();
  });

  test.afterAll(async () => {
    await page.close();
  });
});
