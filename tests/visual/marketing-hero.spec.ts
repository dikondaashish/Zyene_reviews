import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1680, height: 945 },
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 430, height: 932 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("cookie-consent", "declined"),
  );
});

for (const viewport of VIEWPORTS) {
  test(`hero fits ${viewport.width} × ${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".home-hero h1")).toHaveText(
      "More reviews.Less busywork.",
    );
    const shellStyle = await page
      .locator(".home-hero-shell")
      .evaluate((element) => {
        const style = getComputedStyle(element);
        return { borderRadius: style.borderRadius, overflow: style.overflow };
      });
    expect(shellStyle).toEqual({
      borderRadius: viewport.width < 768 ? "24px" : "30px",
      overflow: "hidden",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const boxes = await page
      .locator(".home-hero h1 span, .hero-phone, .hero-laptop-lid")
      .evaluateAll((elements) =>
        elements.map((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          const box =
            element.tagName === "SPAN"
              ? range.getBoundingClientRect()
              : element.getBoundingClientRect();
          return { left: box.left, right: box.right };
        }),
      );
    for (const box of boxes) {
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(viewport.width);
    }
    await expect(page.locator(".home-hero-benefits")).toContainText(
      "Cancel anytime",
    );
    await expect(page.locator(".hero-dashboard-example")).toContainText(
      "Sample data",
    );
    await expect(page.locator(".hero-phone-submit")).toBeVisible();
  });
}

test("phone example supports rating, feedback and retry without sending a review", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const phone = page.locator(".hero-phone");
  await expect(phone.getByRole("button", { name: "Leave a review" })).toBeDisabled();
  await expect(phone.getByText("Choose a rating to continue")).toBeVisible();
  await phone
    .getByRole("radio", { name: "3 stars", exact: true })
    .check({ force: true });
  await expect(phone.locator(".is-filled")).toHaveCount(3);
  await expect(
    phone.getByRole("radio", { name: "3 stars", exact: true }),
  ).toBeChecked();
  await expect(phone.getByText("3 stars selected")).toBeVisible();
  await phone.getByRole("button", { name: "Leave a review" }).click();
  await expect(phone.getByRole("status")).toContainText("Your 3-star demo rating was saved.");
  await expect(phone.getByRole("status")).toContainText("Nothing was sent.");
  await phone.getByRole("button", { name: "Try again" }).click();
  await expect(phone.locator(".is-filled")).toHaveCount(0);
  await phone.getByRole("radio", { name: "1 star", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    phone.getByRole("radio", { name: "2 stars", exact: true }),
  ).toBeChecked();
});

test("phone uses a realistic narrow device ratio", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const ratio = await page.locator(".hero-phone").evaluate((phone) =>
    phone.clientWidth / phone.clientHeight,
  );
  expect(ratio).toBeLessThanOrEqual(0.52);
});

test("reduced motion disables all hero motion and keeps content visible", async ({
  page,
}) => {
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat/i.test(message.text()))
      hydrationErrors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const animations = await page
    .locator(".home-hero")
    .evaluate((hero) => hero.getAnimations({ subtree: true }).length);
  expect(animations).toBe(0);
  const ambientMotion = await page
    .locator(".home-hero-shell")
    .evaluate((shell) => getComputedStyle(shell, "::before").animationName);
  expect(ambientMotion).toBe("none");
  await expect(page.locator(".hero-phone")).toHaveAttribute(
    "data-interacted",
    "false",
  );
  expect(hydrationErrors).toEqual([]);
  await expect(page.locator(".home-hero h1 span").first()).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(page.locator(".hero-phone-stars svg").first()).toHaveCSS(
    "fill",
    "rgba(0, 0, 0, 0)",
  );
});

test("existing navigation, trial links and product tour remain available", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page
      .locator(".home-hero-actions")
      .getByRole("link", { name: "Start your free trial" }),
  ).toHaveAttribute("href", /\/signup$/);
  await expect(
    page
      .locator(".home-hero-actions")
      .getByRole("link", { name: "Try the product tour" }),
  ).toHaveAttribute("href", "#home-product-tour");
  const platform = page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Platform", exact: true });
  await platform.click();
  await expect(platform).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(platform).toHaveAttribute("aria-expanded", "false");
  await page
    .locator(".home-hero-actions")
    .getByRole("link", { name: "Try the product tour" })
    .click();
  await expect(page.locator("#home-product-tour")).toBeInViewport();
  await page.getByRole("tab", { name: "Review requests", exact: true }).click();
  await expect(
    page.getByRole("tab", { name: "Review requests", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole("button", { name: "Toggle menu" });
  await menu.click();
  await expect(page.locator("#marketing-mobile-nav")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#marketing-mobile-nav")).not.toBeVisible();
  await expect(menu).toBeFocused();
});

test("phone starts neutral and yields to a customer's chosen rating", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const phone = page.locator(".hero-phone");
  const stars = phone.locator(".hero-phone-stars svg");
  await expect(stars.last()).toHaveCSS("fill", "rgba(0, 0, 0, 0)");
  await phone
    .getByRole("radio", { name: "2 stars", exact: true })
    .check({ force: true });
  await expect(phone.locator(".is-filled")).toHaveCount(2);
  await expect(stars.last()).toHaveCSS("fill", "rgba(0, 0, 0, 0)");
});
