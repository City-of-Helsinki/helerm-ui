import { expect, test } from '@playwright/test';

import { acceptCookieConsent } from '../utils.js';

test.describe('Accessibility Statement', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/accessibility');
    await acceptCookieConsent(page);
  });

  test('title', async () => {
    await expect(page.getByRole('heading', { name: 'Saavutettavuusseloste', exact: true })).toBeVisible();

    await page.close();
  });
});
