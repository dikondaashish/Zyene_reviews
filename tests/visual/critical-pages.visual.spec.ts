import { expect, test, type Page } from "@playwright/test";

const PAGES = [
  { name: "home", path: "/" },
  { name: "login", path: "/login" },
  { name: "signup", path: "/signup" },
  { name: "docs", path: "/docs" },
  { name: "docs-api", path: "/docs/api" },
] as const;

async function forceTheme(page: Page, mode: "light" | "dark") {
  await page.addInitScript((theme) => {
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Ignore localStorage write failures in strict environments.
    }
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, mode);
}

for (const mode of ["light", "dark"] as const) {
  test.describe(`${mode} mode`, () => {
    test.beforeEach(async ({ page }) => {
      await forceTheme(page, mode);
    });

    for (const pageMeta of PAGES) {
      test(`visual snapshot: ${pageMeta.name}`, async ({ page }) => {
        await page.goto(pageMeta.path, { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(250);

        await expect(page).toHaveScreenshot(`${pageMeta.name}-${mode}.png`, {
          fullPage: true,
        });
      });
    }
  });
}
