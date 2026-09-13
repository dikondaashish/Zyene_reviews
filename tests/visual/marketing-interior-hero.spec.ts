import { expect, test } from "@playwright/test";

const LANDING_HERO_PAGES = [
  { path: "/help", variant: "support", media: "product" },
  { path: "/industries/restaurants", variant: "story", media: "photo" },
  { path: "/features/ai-replies", variant: "product", media: "product" },
  { path: "/features", variant: "directory", media: "none" },
  { path: "/how-it-works", variant: "product", media: "none" },
  { path: "/compare", variant: "directory", media: "none" },
  { path: "/contact", variant: "conversion", media: "none" },
  { path: "/demo", variant: "conversion", media: "none" },
  { path: "/security", variant: "reading", media: "none" },
  { path: "/blog", variant: "directory", media: "none" },
  { path: "/resources", variant: "directory", media: "none" },
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("cookie-consent", "declined"));
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const { path, variant, media } of LANDING_HERO_PAGES) {
  test(`${path} uses its ${variant} hero contract on desktop and mobile`, async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/\S+/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /\S+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/www\.zyenereviews\.com\//);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /\S+/);

    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => document.fonts.ready);

      const hero = page.locator(`.landing-hero--${variant}`);
      await expect(hero).toHaveAttribute("data-hero-media", media);
      await expect(page.locator("main#main-content")).toHaveCSS("background-image", "none");
      await expect(page.locator("h1")).toHaveCount(1);

      if (media === "photo") {
        const photo = hero.locator("img");
        await expect(photo).toBeVisible();
        await expect.poll(() => photo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
        const heading = await hero.locator("h1").boundingBox();
        const picture = await photo.boundingBox();
        expect(heading).not.toBeNull();
        expect(picture).not.toBeNull();
        expect(heading!.x + heading!.width <= picture!.x + 1 || heading!.y + heading!.height <= picture!.y).toBe(true);
      }

      if (media === "product") {
        await expect(hero.locator(".landing-hero-product")).toBeVisible();
      }

      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}

test("pricing keeps the buying decision focused on plan information", async ({ page }) => {
  await page.goto("/pricing", { waitUntil: "domcontentloaded" });
  const intro = page.locator(".interior-pricing-intro");
  await expect(intro).toHaveAttribute("data-hero-media", "none");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(intro.getByRole("img")).toHaveCount(0);
});

test("help search accepts natural multi-word queries and opens the matching guide", async ({ page }) => {
  await page.goto("/help", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Search help articles").fill("automatic replies");
  const results = page.getByRole("navigation", { name: "Help search results" });
  await expect(results.getByRole("link", { name: /Automatic Google Replies/ })).toBeVisible();
  await results.getByRole("link", { name: /Automatic Google Replies/ }).click();
  await expect(page).toHaveURL(/setting-up-auto-commenter$/);
  await expect(page.locator("h1")).toContainText(/Automatic|Auto/);
});

test("homepage keeps its dedicated hero", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".home-hero")).toBeVisible();
  await expect(page.locator(".landing-hero")).toHaveCount(0);
});
