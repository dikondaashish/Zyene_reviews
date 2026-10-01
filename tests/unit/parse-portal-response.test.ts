import { describe, expect, it } from "vitest";
import { apiOk } from "@/app/api/_shared/responses";
import { parsePortalResponse } from "@/lib/billing/parse-portal-response";

describe("billing portal response", () => {
    it("reads the link from the actual API success envelope", async () => {
        const url = "https://billing.stripe.com/p/session/synthetic-test";
        expect(parsePortalResponse(await apiOk({ url }).json())).toBe(url);
    });

    it.each([null, {}, { success: true, data: {} }, { success: false, error: "Denied" }])(
        "reports an error instead of silently doing nothing for %j", (payload) => {
            expect(() => parsePortalResponse(payload)).toThrow("billing portal link is unavailable");
        },
    );

    it.each(["javascript:alert(1)", "https://example.com", "http://billing.stripe.com", "https://billing.stripe.com.example.com"])(
        "rejects an invalid portal destination: %s", (url) => {
            expect(() => parsePortalResponse({ success: true, data: { url } })).toThrow();
        },
    );
});
