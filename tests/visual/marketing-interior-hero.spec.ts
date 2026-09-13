import { expect, test } from "@playwright/test";

const INTERIOR_PAGES = [
  { path: "/help", theme: "guidance", artwork: "guidance-hero.webp" },
  { path: "/industries/restaurants", theme: "local", artwork: "local-business-hero.webp" },
  { path: "/pricing", theme: "product", artwork: "product-hero.webp" },
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("cookie-consent", "declined"));
  await page.setViewportSize({ width: 1440, height: 900 });
});

for (const interiorPage of INTERIOR_PAGES) {
  test(`${interiorPage.path} carries its contextual hero artwork`, async ({ page }) => {
    await page.goto(interiorPage.path, { waitUntil: "domcontentloaded" });
    const main = page.locator("main#main-content");
    await expect(main).toHaveAttribute("data-interior-hero", interiorPage.theme);
    await expect(main).toHaveCSS("background-image", new RegExp(interiorPage.artwork));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("the homepage keeps its dedicated hero without an interior backdrop", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("main#main-content")).not.toHaveAttribute("data-interior-hero");
});
