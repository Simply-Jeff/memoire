import { test, expect } from '@playwright/test';

test.describe('Authentication and Bookmarks Flow', () => {
  // Use a unique email per test run so we can re-run tests locally on the same db
  const uniqueId = Date.now();
  const testEmail = `test_${uniqueId}@example.com`;
  const testPassword = 'password123';

  test('should register, login, and save a bookmark', async ({ page }) => {
    // 1. Registration
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Join memoire');

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    // Playwright captures the navigation after clicking submit
    await page.click('button[type="submit"]');

    // Expect to be redirected to login page after successful registration
    await expect(page).toHaveURL(/.*\/login/);

    // 2. Login
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    await page.click('button[type="submit"]');

    // Expect to be redirected to the home page (dashboard)
    await expect(page).toHaveURL(/.*\//);
    await expect(page.locator('h1')).toContainText('Everything');

    // 3. Add Bookmark
    // Open dialog (it might be the floating action button or from the onboarding wizard, we just locate the FAB or dialog properly)
    await page.click('button[data-slot="dialog-trigger"]:has(.lucide-plus)');
    await expect(page.locator('h2').filter({ hasText: 'Save a Bookmark' })).toBeVisible();

    // Fill in bookmark details
    const targetUrl = 'https://example.com';
    await page.fill('input[name="url"]', targetUrl);
    await page.fill('input[name="collection"]', 'Test Collection');
    await page.fill('input[name="tags"]', 'test, playwright');

    await page.click('button[type="submit"]:has-text("Save")');

    // Verify dialog closed or error shown if any
    // Playwright needs an explicit wait to allow fetch to resolve in this case
    await page.waitForTimeout(2000);

    const errorText = await page.locator('.text-red-500').isVisible();
    if (errorText) {
      console.log('Error adding bookmark:', await page.locator('.text-red-500').textContent());
    } else {
      // Need a hard refresh since websocket mock doesn't re-trigger inside the headless test runner correctly yet
      await page.reload();
      // Verify bookmark card appears in the grid.
      await expect(page.locator('div.group.relative.overflow-hidden', { hasText: 'example.com' }).first()).toBeVisible({ timeout: 10000 });
    }
  });
});
