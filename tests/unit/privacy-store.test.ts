import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Minimal cookie jar: honours max-age=0 deletes, ignores attributes. */
function installBrowser(opts: { jurisdiction?: string; gpc?: boolean; legacy?: Record<string, string> } = {}) {
    const jar = new Map<string, string>();
    if (opts.jurisdiction) jar.set("zyene_jurisdiction", opts.jurisdiction);
    const storage = new Map(Object.entries(opts.legacy ?? {}));
    const reload = vi.fn();
    vi.stubGlobal("document", {
        get cookie() {
            return [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
        },
        set cookie(value: string) {
            const [pair, ...attrs] = value.split("; ");
            const [name, val] = [pair.slice(0, pair.indexOf("=")), pair.slice(pair.indexOf("=") + 1)];
            if (attrs.includes("max-age=0")) jar.delete(name);
            else jar.set(name, val);
        },
    });
    vi.stubGlobal("window", {
        location: { hostname: "www.zyenereviews.com", protocol: "https:", reload },
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    });
    vi.stubGlobal("navigator", { globalPrivacyControl: opts.gpc ?? false });
    vi.stubGlobal("localStorage", {
        getItem: (k: string) => storage.get(k) ?? null,
        removeItem: (k: string) => storage.delete(k),
    });
    return { jar, reload, storage };
}

async function loadStore() {
    vi.resetModules();
    return import("@/lib/privacy/privacy-store");
}

beforeEach(() => vi.stubGlobal("Event", class { constructor(public type: string) {} }));
afterEach(() => vi.unstubAllGlobals());

describe("privacy store (browser)", () => {
    it("blocks analytics and marketing before consent in the EU", async () => {
        installBrowser({ jurisdiction: "EU_EEA" });
        const { hasConsent, getPrivacyState } = await loadStore();
        expect(hasConsent("analytics")).toBe(false);
        expect(hasConsent("marketing")).toBe(false);
        expect(getPrivacyState().showBanner).toBe(true);
    });

    it("treats a missing jurisdiction cookie as OTHER (opt-in)", async () => {
        installBrowser();
        const { getPrivacyState } = await loadStore();
        expect(getPrivacyState()).toMatchObject({ jurisdiction: "OTHER", showBanner: true });
    });

    it("enables categories after consent and persists them in the shared cookie", async () => {
        const { jar, reload } = installBrowser({ jurisdiction: "EU_EEA" });
        const { hasConsent, savePrivacyChoice } = await loadStore();
        savePrivacyChoice({ functional: false, analytics: true, marketing: false });
        expect(jar.get("zyene_consent")).toMatch(/^v3\.f0\.a1\.m0\.EU_EEA\.\d+$/);
        expect(hasConsent("analytics")).toBe(true);
        expect(hasConsent("marketing")).toBe(false);
        expect(reload).not.toHaveBeenCalled();
    });

    it("withdrawing consent clears tracker cookies and reloads to unload scripts", async () => {
        const { jar, reload } = installBrowser({ jurisdiction: "EU_EEA" });
        const { savePrivacyChoice } = await loadStore();
        savePrivacyChoice({ functional: true, analytics: true, marketing: true });
        jar.set("_ga", "GA1.1.1");
        jar.set("_fbp", "fb.1");
        jar.set("sb-access-token", "keep-me");
        savePrivacyChoice({ functional: true, analytics: false, marketing: false });
        expect(jar.has("_ga")).toBe(false);
        expect(jar.has("_fbp")).toBe(false);
        expect(jar.get("sb-access-token")).toBe("keep-me"); // essential auth cookie untouched
        expect(reload).toHaveBeenCalledTimes(1);
    });

    it("US: allowed by default, GPC turns marketing off", async () => {
        installBrowser({ jurisdiction: "US" });
        expect((await loadStore()).hasConsent("marketing")).toBe(true);
        vi.unstubAllGlobals();
        installBrowser({ jurisdiction: "US", gpc: true });
        const store = await loadStore();
        expect(store.hasConsent("marketing")).toBe(false);
        expect(store.hasConsent("analytics")).toBe(true);
        expect(store.privacyRequestHeaders()).toEqual({ "x-zyene-gpc": "1" });
    });

    it("honours GPC seen by the server (Sec-GPC) even without the JS property", async () => {
        installBrowser({ jurisdiction: "US.gpc" });
        expect((await loadStore()).hasConsent("marketing")).toBe(false);
    });

    it("migrates the old localStorage choice once", async () => {
        const { jar, storage } = installBrowser({ jurisdiction: "UK", legacy: { "cookie-consent": "declined" } });
        const { getPrivacyState } = await loadStore();
        expect(getPrivacyState()).toMatchObject({ decided: true, showBanner: false });
        expect(jar.get("zyene_consent")).toMatch(/^v3\.f0\.a0\.m0\.UK\./);
        expect(storage.size).toBe(0);
    });

    it("reports an explicit analytics rejection for cookieless measurement", async () => {
        installBrowser({ jurisdiction: "US" });
        const store = await loadStore();
        expect(store.analyticsExplicitlyRejected()).toBe(false);
        store.savePrivacyChoice({ functional: true, analytics: false, marketing: true });
        expect(store.analyticsExplicitlyRejected()).toBe(true);
    });
});
