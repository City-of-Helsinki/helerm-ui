/* eslint-disable import/prefer-default-export */
export const acceptCookieConsent = async (page) => {
  await page.waitForLoadState('networkidle');

  try {
    const cookieButton = page.getByRole('button', {
      name: /hyväksy kaikki evästeet/i,
    });

    // Wait for the button to be visible with a shorter timeout
    await cookieButton.waitFor({ timeout: 5000 });
    await cookieButton.click();

    // Wait a bit for the banner to disappear
    await page.waitForTimeout(1000);
  } catch {
    // If cookie consent banner doesn't appear or button is not found,
    // just continue - it might already be accepted or not implemented
  }
};
