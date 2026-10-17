import { expect, test } from "./marketing-fixtures";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => localStorage.setItem("cookie-consent", "declined"));
  await page.goto("/#home-product-tour");
  await expect(page.locator("#home-product-tour .tour-container[data-ready=true]")).toBeVisible();
});

test("types a tone draft, preserves edits, publishes and resets", async ({ page }) => {
  const demo = page.locator("#home-product-tour");
  await expect(demo.locator(".tour-tablet")).toBeVisible();
  await demo.getByRole("button", { name: "professional", exact: true }).click();
  const reply = demo.getByRole("textbox", { name: "Edit the example reply" });
  await expect(reply).toHaveAttribute("aria-busy", "true");
  await expect(reply).toHaveAttribute("aria-busy", "false");
  await reply.fill("Thank you for visiting. See you soon!");
  await demo.getByRole("button", { name: "Publish in demo" }).click();
  await expect(demo.locator(".tour-published-reply")).toContainText("Thank you for visiting. See you soon!");
  await demo.getByRole("button", { name: "Reset demo" }).click();
  await expect(demo.locator(".tour-published-reply")).toHaveCount(0);
});

test("composes a request and delivers it to an interactive customer preview", async ({ page }) => {
  const demo = page.locator("#home-product-tour");
  await demo.getByRole("tab", { name: "Review requests" }).click();
  await demo.getByRole("button", { name: "Write with AI" }).click();
  const message = demo.getByRole("textbox", { name: "3. Personalize your message" });
  await expect(message).toHaveAttribute("aria-busy", "true");
  await expect(message).toHaveAttribute("aria-busy", "false");
  await demo.getByRole("button", { name: "Send demo request" }).click();
  await expect(demo.getByRole("button", { name: "Sending sample" })).toBeDisabled();
  await expect(demo.getByText("Delivered in demo only", { exact: true })).toBeVisible();
  await demo.getByRole("button", { name: /Open your demo review link/ }).click();
  await demo.getByRole("button", { name: "4 stars", exact: true }).click();
  await demo.getByRole("button", { name: "Save demo feedback" }).click();
  await expect(demo.getByText("Your 4-star sample feedback was saved in this demo only.")).toBeVisible();
});

test("reduced motion completes drafts immediately and supports keyboard tabs", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const demo = page.locator("#home-product-tour");
  await demo.getByRole("button", { name: "concise", exact: true }).click();
  await expect(demo.getByRole("textbox", { name: "Edit the example reply" })).toHaveAttribute("aria-busy", "false");
  await demo.getByRole("tab", { name: "Reviews & replies" }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(demo.getByRole("tab", { name: "Review requests" })).toBeFocused();
});

test("fits narrow screens with usable controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const demo = page.locator("#home-product-tour");
  await demo.getByRole("tab", { name: "Review requests" }).click();
  await expect(demo.getByRole("button", { name: "Send demo request" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

