import { Page, expect, test } from '@playwright/test';


test.describe("Frontpage", () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await page.goto('/');
    });


    test('title', async () => {
        const pageTitle = await page.title();
        expect(pageTitle).toContain("Tiedonohjaus");
    });

 
    test('Open links', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: '14 Elinkeino- ja työ' }).click();
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

    test.afterAll(async () => {
        await page.close();
    });
})
