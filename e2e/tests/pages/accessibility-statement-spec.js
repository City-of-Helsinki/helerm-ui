import { expect, test, } from '@playwright/test';

import { acceptCookieConcent } from '../utils.js';

test.describe('Accessibility Statement', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    await acceptCookieConcent(page);
  });

  test('title', async () => {
    await page.goto('/accessibility');

    await expect(page.getByRole('heading', { name: 'Saavutettavuusseloste', exact: true })).toBeVisible();

    await page.close();
  });
});
