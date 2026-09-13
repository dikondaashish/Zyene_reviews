import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("cookie-consent", "declined"));
});

test("appointment booking opens the calendar overlay from desktop and mobile navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const desktopNav = page.getByRole("navigation", { name: "Main navigation" });
  await desktopNav.getByRole("button", { name: "Book an appointment" }).click();
  const bookingDialog = page.getByRole("dialog", { name: "Book a Zyene Reviews demo" });
  await expect(bookingDialog).toBeVisible();
  await expect(bookingDialog.getByTitle("Schedule a Zyene Reviews demo on Cal.com")).toHaveAttribute("src", /cal\.com\/zyene\/30-min-meeting/);
  await bookingDialog.getByRole("button", { name: "Close booking calendar" }).click();
  await expect(bookingDialog).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  const menuButton = page.getByRole("button", { name: "Toggle menu" });
  await menuButton.click();
  const mobileNav = page.locator("#marketing-mobile-nav");
  await expect(mobileNav).toBeVisible();
  await mobileNav.getByRole("button", { name: "Book an appointment" }).click();
  await expect(bookingDialog).toBeVisible();
});
