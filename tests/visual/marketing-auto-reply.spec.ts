import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => localStorage.setItem("cookie-consent", "declined"));
  await page.goto("/#home-product-tour");
  await expect(page.locator(".tour-story-section[data-ready=true]")).toBeVisible();
});

test("automatically types and publishes an eligible new sample review", async ({ page }) => {
  const demo = page.getByRole("region", { name: "Automatic reply demo" });
  await expect(demo.getByRole("switch", { name: "Try automatic replies" })).not.toBeChecked();
  await demo.getByRole("switch", { name: "Try automatic replies" }).click();
  await expect(demo.locator(".tour-auto-result")).toHaveAttribute("aria-busy", "true");
  await expect(demo.getByText("Published in demo only", { exact: true })).toBeVisible();
  await expect(demo.locator(".tour-auto-reply")).toContainText("Thank you for your review, Taylor.");
  await expect(page.locator(".tour-status")).toHaveText("3 awaiting a reply");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(demo.getByRole("switch", { name: "Try automatic replies" })).not.toBeChecked();
});

test("rating and tone settings control the next sample reply", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const demo = page.getByRole("region", { name: "Automatic reply demo" });
  await demo.getByLabel("Reviews to reply to", { exact: true }).selectOption("5");
  await demo.getByRole("switch", { name: "Try automatic replies" }).click();
  await expect(demo.getByText("Skipped · below your rating threshold", { exact: true })).toBeVisible();
  await expect(demo.locator(".tour-auto-reply")).toHaveCount(0);
  await demo.getByLabel("Reviews to reply to", { exact: true }).selectOption("3");
  await demo.getByRole("button", { name: "Use Friendly for automatic replies" }).click();
  await demo.getByLabel("Sample review rating", { exact: true }).selectOption("3");
  await demo.getByRole("button", { name: "Preview a new review" }).click();
  await expect(demo.getByText("Published in demo only", { exact: true })).toBeVisible();
  await expect(demo.locator(".tour-auto-reply")).toContainText("Thanks for being honest, Taylor!");
});

test("turning off cancels a pending reply and fits on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.install();
  const demo = page.getByRole("region", { name: "Automatic reply demo" });
  const toggle = demo.getByRole("switch", { name: "Try automatic replies" });
  await toggle.click();
  await toggle.click();
  await page.clock.runFor(4000);
  await expect(toggle).not.toBeChecked();
  await expect(demo.getByText("Published in demo only", { exact: true })).toHaveCount(0);
  await expect(demo.getByRole("button", { name: "Preview a new review" })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
