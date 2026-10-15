import { expect, test, type Page } from "@playwright/test";

/**
 * Region-aware consent, verified on the network: before consent in opt-in
 * regions no request may reach a tracker host. Jurisdictions are simulated
 * the way Vercel does it, with the `x-vercel-ip-country` request header, so
 * the suite also runs against a production build (`pnpm start`).
 */
const TRACKER = /googletagmanager\.com|google-analytics\.com|connect\.facebook\.net|facebook\.com\/tr|betterstack\.com|cal\.com/;

async function watchTrackers(page: Page): Promise<string[]> {
    const hits: string[] = [];
    // Every external request is stubbed so tests never depend on third parties.
    await page.route("https://**/*", async (route) => {
        const url = route.request().url();
        if (TRACKER.test(url)) {
            hits.push(new URL(url).hostname);
            return route.fulfill({ status: 200, contentType: "text/javascript", body: "" });
        }
        return route.abort();
    });
    return hits;
}

const COUNTRY = { EU_EEA: "DE", UK: "GB", US: "US", OTHER: "IN" } as const;

async function visit(page: Page, path: string, region: keyof typeof COUNTRY, extra: Record<string, string> = {}) {
    await page.setExtraHTTPHeaders({ "x-vercel-ip-country": COUNTRY[region], ...extra });
    await page.goto(path);
}

const banner = (page: Page) => page.getByRole("region", { name: "Your privacy choices" });
const consentCookie = async (page: Page) =>
    (await page.context().cookies()).find((c) => c.name === "zyene_consent")?.value;
const settle = (page: Page) => page.waitForTimeout(2_500);

for (const region of ["EU_EEA", "UK", "OTHER"] as const) {
    test(`${region}: banner shown and nothing optional loads before consent`, async ({ page }) => {
        const hits = await watchTrackers(page);
        await visit(page, "/pricing", region);
        await expect(banner(page)).toBeVisible();
        await settle(page);
        expect(hits).toEqual([]);
        expect(await page.evaluate(() => "dataLayer" in window)).toBe(false);
        expect((await page.context().cookies()).filter((c) => /^_ga|^_fbp|^zyene_utm/.test(c.name))).toEqual([]);
    });
}

test("a missing geo header falls back to the opt-in banner", async ({ page }) => {
    const hits = await watchTrackers(page);
    await page.goto("/pricing");
    await expect(banner(page)).toBeVisible();
    await settle(page);
    expect(hits).toEqual([]);
});

test("EU: Accept all loads GTM with Consent Mode granted, and the choice sticks across pages", async ({ page }) => {
    const hits = await watchTrackers(page);
    await visit(page, "/pricing", "EU_EEA");
    await banner(page).getByRole("button", { name: "Accept all" }).click();
    await expect(banner(page)).toBeHidden();
    await expect.poll(() => hits.includes("www.googletagmanager.com")).toBe(true);
    expect(await consentCookie(page)).toMatch(/^v2\.f1\.a1\.m1\.EU_EEA\.\d+$/);
    const consentDefault = await page.evaluate(() =>
        (window as unknown as { dataLayer: unknown[][] }).dataLayer.find((e) => e[0] === "consent")
    );
    expect(consentDefault?.[2]).toMatchObject({ analytics_storage: "granted", ad_storage: "granted" });
    await page.goto("/about");
    await expect(banner(page)).toBeHidden();
});

test("EU: Reject non-essential keeps trackers off on later pages", async ({ page }) => {
    const hits = await watchTrackers(page);
    await visit(page, "/pricing", "EU_EEA");
    await banner(page).getByRole("button", { name: "Reject non-essential" }).click();
    expect(await consentCookie(page)).toMatch(/^v2\.f0\.a0\.m0\.EU_EEA\./);
    await page.goto("/about");
    await expect(banner(page)).toBeHidden();
    await settle(page);
    expect(hits).toEqual([]);
});

test("EU: Customize with only analytics loads GTM but no functional widgets", async ({ page }) => {
    const hits = await watchTrackers(page);
    await visit(page, "/pricing", "EU_EEA");
    await banner(page).getByRole("button", { name: "Customize" }).click();
    const dialog = page.getByRole("dialog", { name: "Privacy choices" });
    await dialog.getByRole("switch", { name: "analytics" }).click();
    await dialog.getByRole("button", { name: "Save my choices" }).click();
    await expect.poll(() => hits.includes("www.googletagmanager.com")).toBe(true);
    await settle(page);
    expect(hits.some((h) => h.includes("betterstack"))).toBe(false);
    const consentDefault = await page.evaluate(() =>
        (window as unknown as { dataLayer: unknown[][] }).dataLayer.find((e) => e[0] === "consent")
    );
    expect(consentDefault?.[2]).toMatchObject({ analytics_storage: "granted", ad_storage: "denied" });
});

test("Privacy choices reopens settings after a choice, traps focus and restores it on Escape", async ({ page }) => {
    await watchTrackers(page);
    await visit(page, "/pricing", "EU_EEA");
    await banner(page).getByRole("button", { name: "Reject non-essential" }).click();
    const trigger = page.getByRole("contentinfo").getByRole("button", { name: "Privacy choices" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Privacy choices" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("switch", { name: "Essential" })).toBeDisabled();
    await expect(dialog.getByRole("switch", { name: "marketing" })).not.toBeChecked();
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
});

test("US: no banner, opt-out defaults load, and Privacy choices is always available", async ({ page }) => {
    const hits = await watchTrackers(page);
    await visit(page, "/pricing", "US");
    await expect.poll(() => hits.includes("www.googletagmanager.com")).toBe(true);
    await expect(banner(page)).toBeHidden();
    await page.getByRole("contentinfo").getByRole("button", { name: "Privacy choices" }).click();
    const dialog = page.getByRole("dialog", { name: "Privacy choices" });
    await expect(dialog.getByRole("switch", { name: "marketing" })).toBeChecked();
    await dialog.getByRole("switch", { name: "marketing" }).click();
    await dialog.getByRole("button", { name: "Save my choices" }).click();
    await page.waitForLoadState("load"); // withdrawal reloads the page
    expect(await consentCookie(page)).toMatch(/^v2\.f1\.a1\.m0\.US\./);
});

test.describe("US with Global Privacy Control", () => {
    test("marketing is off and locked; analytics still allowed", async ({ page }) => {
        await page.addInitScript(() => Object.defineProperty(navigator, "globalPrivacyControl", { get: () => true }));
        const hits = await watchTrackers(page);
        await visit(page, "/pricing", "US", { "Sec-GPC": "1" });
        await expect.poll(() => hits.includes("www.googletagmanager.com")).toBe(true);
        const consentDefault = await page.evaluate(() =>
            (window as unknown as { dataLayer: unknown[][] }).dataLayer.find((e) => e[0] === "consent")
        );
        expect(consentDefault?.[2]).toMatchObject({ analytics_storage: "granted", ad_storage: "denied" });
        expect(hits.some((h) => h.includes("facebook"))).toBe(false);
        await page.getByRole("contentinfo").getByRole("button", { name: "Privacy choices" }).click();
        await expect(page.getByRole("dialog").getByRole("switch", { name: "marketing" })).toBeDisabled();
    });
});

test("/demo keeps Cal.com off until requested in opt-in regions", async ({ page }) => {
    const hits = await watchTrackers(page);
    await visit(page, "/demo", "EU_EEA");
    await banner(page).getByRole("button", { name: "Reject non-essential" }).click();
    await settle(page);
    expect(hits.some((h) => h.includes("cal.com"))).toBe(false);
    await page.getByRole("button", { name: "Show available times" }).click();
    await expect(page.getByTitle("Schedule a Zyene Reviews demo on Cal.com")).toBeAttached();
});

test("auth pages work after rejecting, with the choice shared and a footer control", async ({ page }) => {
    await watchTrackers(page);
    await visit(page, "/login", "EU_EEA");
    await banner(page).getByRole("button", { name: "Reject non-essential" }).click();
    await expect(page.getByLabel("Email address")).toBeEditable();
    await expect(page.getByRole("button", { name: "Log in", exact: true })).toBeEnabled();
    await expect(page.getByRole("contentinfo").getByRole("button", { name: "Privacy choices" })).toBeVisible();
});

test("mobile: banner fits, buttons are touch-sized and the page does not scroll sideways", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await watchTrackers(page);
    await visit(page, "/pricing", "EU_EEA");
    await expect(banner(page)).toBeInViewport();
    for (const name of ["Customize", "Reject non-essential", "Accept all"]) {
        const box = await banner(page).getByRole("button", { name }).boundingBox();
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
