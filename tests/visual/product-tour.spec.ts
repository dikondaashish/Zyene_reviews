import { test, expect } from "@playwright/test";

/**
 * Product Tour E2E Tests
 * Verifies navigation, visibility, and completion logic.
 */
test.describe("Dashboard Product Tour", () => {
  // NOTE: This test assumes you are logged in or have a storageState.
  // You can run it with: npx playwright test tests/visual/product-tour.spec.ts --project=chromium
  
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto("/dashboard?tour=true");
    
    // Check if we were redirected to login (Auth Block)
    if (page.url().includes("/login")) {
      console.log("\n⚠️  Redirected to login. Please log in manually in the headed browser to continue the test...");
      // You can also automate this if you have credentials:
      // await page.fill('input[name="email"]', 'your-email@example.com');
      // await page.fill('input[name="password"]', 'your-password');
      // await page.click('button[type="submit"]');

      // Wait for navigation back to dashboard (timeout 60s for manual login)
      await page.waitForURL(/.*dashboard.*/, { timeout: 60000 });
      
      // Re-navigate to ensure the tour param is persistent
      await page.goto("/dashboard?tour=true");
    }

    await page.waitForLoadState("networkidle");
  });

  test("should start the tour and navigate through all steps", async ({ page }) => {
    // Check if the tour portal is open
    const tooltip = page.locator(".tour-tooltip");
    await expect(tooltip).toBeVisible();

    // STEP 1: Navigation Menu
    await expect(tooltip.locator(".tour-tooltip-title")).toHaveText("Navigation Menu");
    await expect(tooltip.locator(".tour-tooltip-icon")).toHaveText("🧭");
    await expect(tooltip.locator(".tour-tooltip-step-counter")).toHaveText("1/6");

    // Advance to Step 2
    await page.click(".tour-btn-next");

    // STEP 2: Dashboard Results
    await expect(tooltip.locator(".tour-tooltip-title")).toHaveText("Dashboard Results");
    await expect(tooltip.locator(".tour-tooltip-icon")).toHaveText("📊");
    await expect(tooltip.locator(".tour-tooltip-step-counter")).toHaveText("2/6");

    // Advance to Step 3
    await page.click(".tour-btn-next");

    // STEP 3: Recent Actions
    await expect(tooltip.locator(".tour-tooltip-title")).toHaveText("Recent Actions");
    await expect(tooltip.locator(".tour-tooltip-icon")).toHaveText("💬");
    await expect(tooltip.locator(".tour-tooltip-step-counter")).toHaveText("3/6");

    // Advance to Step 4
    await page.click(".tour-btn-next");

    // STEP 4: Customers
    await expect(tooltip.locator(".tour-tooltip-title")).toHaveText("Customers");
    await expect(tooltip.locator(".tour-tooltip-icon")).toHaveText("👥");
    await expect(tooltip.locator(".tour-tooltip-step-counter")).toHaveText("4/6");

    // Advance to Step 5
    await page.click(".tour-btn-next");

    // STEP 5: Reports & Analytics
    await expect(tooltip.locator(".tour-tooltip-title")).toHaveText("Reports & Analytics");
    await expect(tooltip.locator(".tour-tooltip-icon")).toHaveText("📈");
    await expect(tooltip.locator(".tour-tooltip-step-counter")).toHaveText("5/6");

    // Advance to Step 6 (Final)
    await page.click(".tour-btn-next");

    // STEP 6: Settings & Profile
    await expect(tooltip.locator(".tour-tooltip-title")).toHaveText("Settings & Profile");
    await expect(tooltip.locator(".tour-tooltip-icon")).toHaveText("⚙️");
    await expect(tooltip.locator(".tour-tooltip-step-counter")).toHaveText("6/6");
    
    // Verify "Finish" button text
    await expect(page.locator(".tour-btn-finish")).toHaveText("Got it! 🎉");

    // Complete the tour
    await page.click(".tour-btn-finish");

    // Verify tour is closed
    await expect(tooltip).not.toBeVisible();
  });

  test("should allow navigating backwards using the Prev button", async ({ page }) => {
    // Go to step 2
    await page.click(".tour-btn-next");
    await expect(page.locator(".tour-tooltip-step-counter")).toHaveText("2/6");

    // Click Prev
    await page.click(".tour-btn-prev");
    await expect(page.locator(".tour-tooltip-step-counter")).toHaveText("1/6");
    await expect(page.locator(".tour-tooltip-title")).toHaveText("Navigation Menu");
  });

  test("should close the tour when clicking skip or close", async ({ page }) => {
    // Click Close (X)
    await page.click(".tour-tooltip-close");
    await expect(page.locator(".tour-tooltip")).not.toBeVisible();

    // Restart and click Skip
    await page.goto("/dashboard?tour=true", { waitUntil: "networkidle" });
    await page.click(".tour-btn-skip");
    await expect(page.locator(".tour-tooltip")).not.toBeVisible();
  });
  
  test("should automatically scroll to target elements", async ({ page }) => {
    // Step 3 is "Recent Actions" which is usually at the bottom of the dashboard
    await page.click(".tour-btn-next"); // to 2
    await page.click(".tour-btn-next"); // to 3
    
    // Verify that the page has scrolled (scrollY > 0)
    const scrollY = await page.evaluate(() => window.scrollY);
    // On a standard desktop viewport, step 3 will likely require some scrolling
    // We can't guarantee scrollY > 0 if the screen is huge, but we can verify visibility
    const target = page.locator("[data-tour-target='tour-recent-reviews']");
    await expect(target).toBeInViewport();
  });
});
