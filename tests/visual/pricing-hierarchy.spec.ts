import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("cookie-consent", "declined"));
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("daily equivalents lead the pricing cards at desktop and mobile sizes", async ({ page }) => {
  await page.goto("/pricing", { waitUntil: "domcontentloaded" });

  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 900 });

    const starter = page.locator("#pricing-plans article[aria-labelledby^='starter_']");
    const professional = page.locator("#pricing-plans article[aria-labelledby^='professional_']");

    await expect(starter.locator("[class*='monthlyPrice']")).toContainText("$29.99/month");
    await expect(starter.locator("[class*='dailyPrice']")).toContainText("$0.99/day");
    await expect(professional.locator("[class*='monthlyPrice']")).toContainText("$59.99/month");
    await expect(professional.locator("[class*='dailyPrice']")).toContainText("$1.98/day");

    const hierarchy = await starter.evaluate((card) => {
      const monthly = card.querySelector<HTMLElement>("[class*='monthlyPrice']");
      const daily = card.querySelector<HTMLElement>("[class*='dailyNumber']");
      const amount = daily?.parentElement;
      const cardBox = card.getBoundingClientRect();
      const amountBox = amount?.getBoundingClientRect();

      return {
        dailyFont: daily ? Number.parseFloat(getComputedStyle(daily).fontSize) : 0,
        monthlyFont: monthly ? Number.parseFloat(getComputedStyle(monthly).fontSize) : 0,
        amountFits: Boolean(amountBox && amountBox.left >= cardBox.left && amountBox.right <= cardBox.right),
      };
    });

    expect(hierarchy.dailyFont).toBeGreaterThan(hierarchy.monthlyFont * 3);
    expect(hierarchy.amountFits).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test("homepage uses the same approved Starter price hierarchy", async ({ page }) => {
  await page.goto("/#pricing", { waitUntil: "domcontentloaded" });
  const pricing = page.locator("#pricing");

  await expect(pricing.locator("[class*='monthlyPrice']")).toContainText("$29.99/month");
  await expect(pricing.locator("[class*='dailyPrice']")).toContainText("$0.99/day");
});
