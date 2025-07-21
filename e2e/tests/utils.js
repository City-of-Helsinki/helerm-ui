import { expect } from '@playwright/test';


export const acceptCookieConcent = async (page) => {
    await page.goto('/');
    await expect(page.locator('#cookie-consent-content')).toBeVisible();
    await page.getByTestId('cookie-consent-approve-required-button').click();
};