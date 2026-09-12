import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("cookie-consent", "declined"));
});

test("appointment booking is available in desktop and mobile navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const desktopNav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(desktopNav.getByRole("link", { name: "Book an appointment" })).toHaveAttribute("href", "/demo");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const menuButton = page.getByRole("button", { name: "Toggle menu" });
  await menuButton.click();
  const mobileNav = page.locator("#marketing-mobile-nav");
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Book an appointment" })).toHaveAttribute("href", "/demo");
});
