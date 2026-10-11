import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem("cookie-consent", "declined");
        localStorage.setItem("zyene-home-book-wizard-seen", "1");
        localStorage.setItem("theme", "light");
    });
    await page.route("https://accounts.google.com/**", (route) => route.abort());
    await page.route("**/auth/v1/**", (route) => route.fulfill({ status: 400, contentType: "application/json", body: "{}" }));
});

test("email signup records a start and verification request, without reporting completion or sending email", async ({ page }) => {
    await page.route("**/auth/v1/signup**", (route) => route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({ user: { id: "fixture-user", identities: [], user_metadata: {}, app_metadata: {} }, session: null }),
    }));
    await page.goto("/signup");
    await expect(page.getByRole("main")).toContainText("Card required");
    await expect(page.getByRole("main")).toContainText("bills automatically");
    await page.getByLabel("Full name").fill("Fixture User");
    await page.getByLabel("Email address").fill("fixture@example.com");
    await page.getByLabel("Password", { exact: true }).fill("ExamplePassword123");
    await page.getByRole("button", { name: "Create account", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
    const events = await page.evaluate(() => (window as Window & { dataLayer?: { event?: string; method?: string }[] }).dataLayer
        ?.filter((entry) => entry.event?.startsWith("signup_")));
    expect(events).toEqual([
        { event: "signup_started", method: "email" },
        { event: "signup_verification_requested", method: "email" },
    ]);
});

test("guide dialog loads on opening, retains answers and returns keyboard focus", async ({ page }) => {
    await page.route("**/api/marketing/book-lead", (route) => route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({ downloadUrl: "/zyene-overview.pdf", emailSent: false }),
    }));
    await page.goto("/");
    const trigger = page.locator(".home-guide-offer").getByRole("button", { name: "Get the free guide" });
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Home services", exact: true }).click();
    await dialog.getByRole("button", { name: "Reply faster", exact: true }).click();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(dialog.getByRole("button", { name: "Home services", exact: true })).toHaveAttribute("aria-pressed", "true");
    await dialog.getByRole("button", { name: "Next step" }).click();
    await dialog.getByLabel("Email address").fill("fixture@example.com");
    await dialog.getByRole("button", { name: "Get the free guide" }).click();
    await expect(dialog.getByRole("heading", { name: "Your guide is ready." })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Download the guide" })).toHaveAttribute("href", "/zyene-overview.pdf");
    await dialog.getByRole("button", { name: "Continue browsing" }).click();
    await expect(trigger).toBeFocused();
});

test("blog keeps every article available and search remains usable", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator(".blog-post-card")).toHaveCount(22);
    await page.getByRole("textbox", { name: "Search blog posts" }).fill("Birdeye");
    await expect(page.locator(".blog-post-card").first()).toContainText("Birdeye");
    expect(await page.locator(".blog-post-card").count()).toBeLessThan(22);
    await page.getByRole("textbox", { name: "Search blog posts" }).fill("");
    await expect(page.locator(".blog-post-card")).toHaveCount(22);
});

for (const path of ["/features/ai-replies", "/features/review-collection", "/features/competitor-tracking", "/features/local-seo", "/industries/hotels", "/industries/salons", "/industries/home-services", "/resources/local-seo-checklist", "/compare"]) {
    test(`${path} has usable mobile and desktop content`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://www.zyenereviews.com${path}`);
        for (const width of [1440, 390, 320]) {
            await page.setViewportSize({ width, height: 900 });
            expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        }
        await page.screenshot({ path: test.info().outputPath("page-mobile.png"), fullPage: true });
    });
}
