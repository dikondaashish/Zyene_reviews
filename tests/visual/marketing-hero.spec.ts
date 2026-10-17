import { expect, test } from "./marketing-fixtures";

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("cookie-consent", "declined");
    localStorage.setItem("zyene-home-book-wizard-seen", "1");
  });
});

for (const viewport of VIEWPORTS) {
  test(`hero fits ${viewport.width} × ${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".home-hero h1")).toHaveText(
      "Review management software for local businesses More Google reviews. Less busywork.",
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const boxes = await page
      .locator(".home-hero-kicker, .home-hero-headline > span, .home-hero-actions a")
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect()));
    for (const box of boxes) {
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(viewport.width);
    }
    await expect(page.locator(".home-hero-terms")).toContainText("Cancel anytime in Billing");
    await expect(page.locator("#home-product-tour .tour-container")).toBeVisible();
  });
}

test("reduced motion keeps the hero static and fully visible", async ({ page }) => {
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat/i.test(message.text())) hydrationErrors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#home-product-tour .tour-container[data-ready=true]")).toBeVisible();
  const animations = await page
    .locator(".home-hero")
    .evaluate((hero) => hero.getAnimations({ subtree: true }).length);
  expect(animations).toBe(0);
  for (const selector of [".home-hero-kicker", ".home-hero-headline", ".home-hero-aside"]) {
    await expect(page.locator(selector)).toHaveCSS("opacity", "1");
  }
  expect(hydrationErrors).toEqual([]);
});

test("navigation, trial links and product tour remain available", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const actions = page.locator(".home-hero-actions");
  await expect(actions.getByRole("link", { name: "Start free trial" })).toHaveAttribute("href", /\/signup$/);
  await expect(actions.getByRole("link", { name: "Book a demo" })).toHaveAttribute("href", "/demo");
  const platform = page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Platform", exact: true });
  await platform.click();
  await expect(platform).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(platform).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#home-product-tour .tour-container[data-ready=true]")).toBeVisible();
  const requests = page.locator("#home-product-tour").getByRole("tab", { name: "Review requests", exact: true });
  await requests.click();
  await expect(requests).toHaveAttribute("aria-selected", "true");
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole("button", { name: "Toggle menu" });
  await menu.click();
  await expect(page.locator("#marketing-mobile-nav")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#marketing-mobile-nav")).not.toBeVisible();
  await expect(menu).toBeFocused();
});

test("how-it-works steps switch scenes and the walkthrough can be paused", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const player = page.locator(".flow-player");
  await player.scrollIntoViewIfNeeded();
  await expect(player.locator(".flow-scene--ask")).toBeVisible();
  await player.getByRole("button", { name: "Make reviewing effortless" }).click();
  await expect(player.locator(".flow-scene--collect")).toBeVisible();
  await expect(player.getByRole("button", { name: "Make reviewing effortless" })).toHaveAttribute("aria-current", "step");
  await player.getByRole("button", { name: "Reply in your voice" }).click();
  await expect(player.locator(".flow-scene--reply")).toContainText("Published to Google");
  await player.getByRole("button", { name: "Pause" }).click();
  await expect(player.getByRole("button", { name: "Play" })).toBeVisible();
  await expect(player).toHaveAttribute("data-playing", "false");
});

test("automation pipeline lists every stage and stays inside narrow screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const stages = page.locator(".pipe-stage");
  await expect(stages).toHaveCount(5);
  await expect(stages.first()).toContainText("Visit ends");
  await expect(stages.last()).toContainText("Reply published");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
