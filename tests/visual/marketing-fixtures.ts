import { test as base, expect } from "@playwright/test";

/** Public-page tests use local assets and explicit provider fixtures only. */
export const test = base.extend({
    page: async ({ page }, use) => {
        await page.route("https://**/*", (route) => route.abort());
        await use(page);
    },
});
export { expect };
