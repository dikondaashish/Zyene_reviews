import { test as setup, expect } from "@playwright/test";

/**
 * Authentication Setup
 * Run this once to save your login session for other tests.
 * usage: npx playwright test tests/auth.setup.ts
 */
const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // Navigate to login
  await page.goto("/login");

  // Fill in credentials - REPLACE WITH YOUR TEST CREDENTIALS or use ENV vars
  // await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || '');
  // await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || '');
  // await page.click('button[type="submit"]');

  // Wait for dashboard redirect
  // await expect(page).toHaveURL(/.*dashboard/);

  // Alternatively: If you are already logged in locally, you can manually save storage state
  // and bypass this setup if preferred.
  
  // End of setup: Save the state
  // await page.context().storageState({ path: authFile });
});
