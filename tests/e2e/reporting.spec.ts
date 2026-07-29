import { test, expect } from '@playwright/test';

test.describe('Truck Reporting Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Log in as security guard (context is isolated per test automatically)
    await page.goto('/login');
    await page.getByPlaceholder('Enter your name or email').fill('security@gmail.com');
    await page.getByPlaceholder('Enter your password').fill('security');
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should successfully complete the truck arrival report', async ({ page }) => {
    // 1. Click "Trucks to warehouse" card
    await page.getByRole('button', { name: /Trucks to warehouse/i }).click();
    await expect(page).toHaveURL(/.*trucks\/loaded/);

    // 2. Select the first truck in the list
    // The list has cards containing "Report Arrival" buttons or links
    await page.locator('text=Report Arrival').first().click();
    await expect(page).toHaveURL(/.*trucks\/report\/.*/);

    // 3. Verify the Report Page renders correctly
    await expect(page.getByRole('heading', { name: 'Report Arrival' })).toBeVisible();

    // 4. Interact with the Image Upload
    // We bypass the native camera by setting a global mock flag that the component reads
    await page.evaluate(() => {
      (window as any).__E2E_MOCK_IMAGE__ = 'data:image/png;base64,mock-image-data-for-testing';
    });

    // Click the main image upload area (this should now use our mocked Camera API)
    await page.locator('text=Primary Image').locator('..').locator('div').last().click();

    // Verify the image preview is shown (the img tag appears)
    await expect(page.locator('img[alt="Preview"]').first()).toBeVisible();

    // 5. Fill out the notes
    await page.getByPlaceholder('Add any specific observations or notes here...').fill('Everything looks good, seal intact.');

    // 6. Submit the report
    await page.getByRole('button', { name: 'Submit Report' }).click();

    // 7. Verify Success state and redirect
    await expect(page.getByText('Report Submitted')).toBeVisible();
    
    // After 1.5 seconds, it should redirect back to the truck list
    await expect(page).toHaveURL(/.*trucks\/loaded/, { timeout: 3000 });
  });

});
