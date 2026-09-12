import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";

// Render outside Playwright's component-test JSX transform.
const fixture = execFileSync(process.execPath, ["--import", "tsx", "tests/visual/fixtures/dashboard-color-system.ts"], { encoding: "utf8" });

// Real components and the live stylesheet, with fictional data. No auth bypass or customer actions.
for (const themeName of ["light", "dark"]) {
  test(`${themeName}: dashboard panels fit every breakpoint and preserve the brand`, async ({ page }) => {
    const response = await page.request.get("/");
    const html = await response.text();
    const styles = html.match(/<link[^>]*rel="stylesheet"[^>]*>/g)?.join("") ?? "";
    expect(styles).not.toBe("");
    await page.route("**/__color-fixture", route => route.fulfill({ contentType: "text/html", body: `<!doctype html><html class="${themeName === "dark" ? "dark" : ""}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${styles}</head><body>${fixture}</body></html>` }));
    await page.goto("/__color-fixture");
    await expect(page.getByTestId("page-title")).toHaveCSS("font-size", "24px");
    await expect(page.getByTestId("body-copy")).toHaveCSS("font-size", "14px");
    await expect(page.getByTestId("action")).toHaveCSS("background-color", "rgb(255, 79, 0)");
    for (const status of ["success", "warning"]) {
      const ratio = await page.getByTestId(status).evaluate(element => {
        const canvas = document.createElement("canvas"); canvas.width = canvas.height = 1;
        const ctx = canvas.getContext("2d")!;
        const style = getComputedStyle(element);
        const luminance = (pixels: Uint8ClampedArray) => {
          const linear = Array.from(pixels).slice(0, 3).map(value => { const s = value / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; });
          return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
        };
        ctx.fillStyle = getComputedStyle(document.body).backgroundColor; ctx.fillRect(0, 0, 1, 1);
        ctx.fillStyle = style.backgroundColor; ctx.fillRect(0, 0, 1, 1);
        const background = luminance(ctx.getImageData(0, 0, 1, 1).data);
        ctx.fillStyle = style.color; ctx.fillRect(0, 0, 1, 1);
        const foreground = luminance(ctx.getImageData(0, 0, 1, 1).data);
        return (Math.max(background, foreground) + .05) / (Math.min(background, foreground) + .05);
      });
      expect(ratio, `${status} text contrast`).toBeGreaterThanOrEqual(4.5);
    }
    for (const width of [320, 390, 768, 1024, 1280]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px overflow`).toBe(true);
      await expect(page.locator("[inert]")).toHaveCSS("opacity", "0");
      expect(await page.locator("[inert]").evaluate(element => element.getBoundingClientRect().height)).toBe(0);
    }
    await page.getByRole("button", { name: /Follow up with your customers/ }).focus();
    await page.keyboard.press("Tab");
    await expect(page.getByTestId("action")).toBeFocused();
    await page.screenshot({ path: `test-results/dashboard-color-${themeName}.png`, fullPage: true });
  });
}
