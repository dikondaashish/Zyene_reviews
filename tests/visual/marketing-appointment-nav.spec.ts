import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("cookie-consent", "declined"));
});

test("appointment booking links to Cal.com from desktop and mobile navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const desktopNav = page.getByRole("navigation", { name: "Main navigation" });
  const desktopLink = desktopNav.getByRole("link", { name: "Book an appointment" });
  await expect(desktopLink).toHaveAttribute("href", "https://cal.com/zyenereviews/15min");
  await expect(desktopLink).toHaveAttribute("target", "_blank");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  const menuButton = page.getByRole("button", { name: "Toggle menu" });
  await menuButton.click();
  const mobileNav = page.locator("#marketing-mobile-nav");
  await expect(mobileNav).toBeVisible();
  const mobileLink = mobileNav.getByRole("link", { name: "Book an appointment" });
  await expect(mobileLink).toHaveAttribute("href", "https://cal.com/zyenereviews/15min");
  await expect(mobileLink).toHaveAttribute("target", "_blank");
});
