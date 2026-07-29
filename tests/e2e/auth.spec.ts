import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  


  test('should successfully log in as a security guard', async ({ page }) => {
    // Navigate to the app (should redirect to login if unauthenticated)
    await page.goto('/');
    
    // Expect to be on the login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    // Fill out the login form
    await page.getByPlaceholder('Enter your name or email').fill('security');
    await page.getByPlaceholder('Enter your password').fill('security');
    
    // Wait for the login screen's 1.2s loading animation to finish
    await page.waitForTimeout(1500);

    // Submit the form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // We should be redirected to the dashboard automatically
    // The security guard is named 'Security User'
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText('Security User')).toBeVisible();
    await expect(page.getByText('Trucks to warehouse')).toBeVisible();
  });

  test('should successfully log out', async ({ page }) => {
    // 1. Log in first
    await page.goto('/login');
    await page.getByPlaceholder('Enter your name or email').fill('security');
    await page.getByPlaceholder('Enter your password').fill('security');
    await page.waitForTimeout(1500); // wait for animation
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/.*dashboard/);

    // 2. Navigate to Profile page using bottom navigation
    // Wait for bottom nav to be visible
    const profileTab = page.getByRole('link').nth(1); // Assuming it's the second icon in BottomNav
    await profileTab.click();
    await expect(page).toHaveURL(/.*profile/);

    // 3. Click Logout
    await page.getByRole('button', { name: 'Sign Out' }).click();

    // 4. Verify redirected to login and localStorage cleared
    await expect(page).toHaveURL(/.*login/);
    const userStorage = await page.evaluate(() => window.localStorage.getItem('mockUser'));
    expect(userStorage).toBeNull();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill out invalid credentials
    await page.getByPlaceholder('Enter your name or email').fill('wrong-number');
    await page.getByPlaceholder('Enter your password').fill('wrong-password');
    await page.waitForTimeout(1500); // wait for animation
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify error message
    await expect(page.getByText('Invalid credentials. Try security/security or manager/manager')).toBeVisible();
    await expect(page).toHaveURL(/.*login/);
  });
});
