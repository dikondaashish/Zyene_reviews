import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("cookie-consent", "declined");
    localStorage.setItem("theme", "light");
  });
  await page.route("https://accounts.google.com/**", (route) => route.abort());
  await page.route("**/auth/v1/**", (route) => route.fulfill({
    status: 400, contentType: "application/json",
    body: JSON.stringify({ error: "invalid_grant", error_description: "Invalid login credentials" }),
  }));
});

test("dark mode preserves readable controls and the brand orange", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: "Log in", exact: true })).toHaveCSS("background-color", "rgb(255, 79, 0)");
  await expect(page.getByLabel("Email address")).toBeVisible();
  await page.setViewportSize({ width: 320, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

for (const path of ["/login", "/signup", "/forgot-password"]) {
  test(`${path} is usable on desktop and narrow mobile`, async ({ page }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toHaveCount(1);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.getByLabel("Email address")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await expect(page.locator('button[type="submit"]')).toHaveCSS("background-color", "rgb(255, 79, 0)");
      await expect(page.getByLabel("Email address")).toHaveCSS("font-size", "16px");
      if (width !== 390) {
        await page.screenshot({ path: test.info().outputPath(`auth-${width}.png`), fullPage: true });
      }
    }
  });
}

test("login keeps password controls, invitation context, and recoverable errors", async ({ page }) => {
  await page.goto("/login?invite=test-invitation&next=%2Freviews", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("link", { name: "Create an account" })).toHaveAttribute(
    "href", "/signup?next=%2Freviews&invite=test-invitation");
  await page.getByLabel("Email address").fill("auth-ui-test@example.com");
  await page.getByLabel("Password", { exact: true }).fill("ExamplePassword123");
  await page.getByRole("button", { name: "Show password", exact: true }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Check your email and password" })).toBeVisible();
  await expect(page.getByLabel("Email address")).toHaveValue("auth-ui-test@example.com");
  await expect(page.getByRole("button", { name: "Log in", exact: true })).toBeEnabled();
});

test("signup keeps optional consent off and exposes it only on request", async ({ page }) => {
  await page.goto("/signup?invite=test-invitation", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Join your team" })).toBeVisible();
  await expect(page.getByLabel("Mobile number")).toBeHidden();
  await page.locator("summary").click();
  await expect(page.getByLabel("Mobile number")).toBeVisible();
  await expect(page.locator("#smsReviewAlertsConsent")).not.toBeChecked();
  await expect(page.getByRole("link", { name: "Log in", exact: true })).toHaveAttribute("href", "/login?invite=test-invitation");
});

test("password reset confirms privately without sending a real email", async ({ page }) => {
  await page.route("**/auth/v1/recover**", (route) => route.fulfill({
    status: 200, contentType: "application/json", body: "{}",
  }));
  await page.goto("/forgot-password", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email address").fill("auth-ui-test@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
  await expect(page.getByRole("main")).toContainText("If an account exists");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("a button")).toHaveCount(0);
});
