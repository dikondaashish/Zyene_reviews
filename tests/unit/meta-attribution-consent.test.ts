import { describe, expect, it } from "vitest";
import { createConsentRecord, serializeConsent } from "@/lib/privacy/consent-record";
import { metaConsentMetadataFromRequest } from "@/lib/privacy/meta-attribution-consent";

function request(marketing: boolean, extraHeaders: Record<string, string> = {}) {
    const record = createConsentRecord({ functional: false, analytics: false, marketing }, "UK");
    return new Request("https://app.zyenereviews.com/api/privacy/meta-consent", {
        headers: {
            cookie: `zyene_consent=${serializeConsent(record)}; _fbp=fb.1.1760900000.123456; _fbc=fb.1.1760900000.click_123`,
            ...extraHeaders,
        },
    });
}

describe("Meta attribution consent", () => {
    it("stores click/browser cookies only when marketing consent is granted", () => {
        expect(metaConsentMetadataFromRequest(request(true))).toMatchObject({
            meta_marketing_consent: "1",
            meta_fbp: "fb.1.1760900000.123456",
            meta_fbc: "fb.1.1760900000.click_123",
        });
    });

    it("clears attribution cookies when marketing consent is withdrawn", () => {
        expect(metaConsentMetadataFromRequest(request(false))).toEqual({
            meta_marketing_consent: "0",
            meta_fbp: "",
            meta_fbc: "",
        });
    });

    it("treats Global Privacy Control as a marketing opt-out", () => {
        expect(metaConsentMetadataFromRequest(request(true, { "sec-gpc": "1" }))).toEqual({
            meta_marketing_consent: "0",
            meta_fbp: "",
            meta_fbc: "",
        });
    });

    it("honors a browser-only GPC signal forwarded by a same-origin API request", () => {
        expect(metaConsentMetadataFromRequest(request(true, { "x-zyene-gpc": "1" }))).toEqual({
            meta_marketing_consent: "0",
            meta_fbp: "",
            meta_fbc: "",
        });
    });

    it("does not send a new paid-conversion event under an unconfirmed v2 marketing choice", () => {
        const stale = new Request("https://app.zyenereviews.com/api/billing/checkout", {
            headers: {
                cookie: `zyene_consent=v2.f0.a1.m1.US.${Date.now()}; _fbp=fb.1.1760900000.123456`,
            },
        });
        expect(metaConsentMetadataFromRequest(stale)).toEqual({
            meta_marketing_consent: "0",
            meta_fbp: "",
            meta_fbc: "",
        });
    });

    it("does not preserve malformed attribution cookies", () => {
        const input = request(true);
        const cookie = input.headers.get("cookie")!.replace("fb.1.1760900000.123456", "not-a-meta-cookie");
        const sanitized = new Request(input.url, {
            headers: { cookie },
        });
        expect(metaConsentMetadataFromRequest(sanitized)).toEqual({
            meta_marketing_consent: "1",
            meta_fbp: "",
            meta_fbc: "fb.1.1760900000.click_123",
        });
    });
});
