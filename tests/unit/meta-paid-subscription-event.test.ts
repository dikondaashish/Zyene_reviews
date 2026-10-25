import { afterEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { sendMetaPaidSubscriptionEvent, shouldTrackFirstPaidSubscription } from "@/services/stripe/meta-paid-subscription-event";

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe("Meta paid subscription event eligibility", () => {
    it("tracks a paid subscription created without a trial", () => {
        expect(shouldTrackFirstPaidSubscription({
            invoiceStatus: "paid",
            amountPaid: 2900,
            billingReason: "subscription_create",
            trialEnd: null,
            servicePeriodStart: 1_800_000_000,
        })).toBe(true);
    });

    it("tracks the first paid invoice exactly at the end of a trial", () => {
        expect(shouldTrackFirstPaidSubscription({
            invoiceStatus: "paid",
            amountPaid: 2900,
            billingReason: "subscription_cycle",
            trialEnd: 1_800_000_000,
            servicePeriodStart: 1_800_000_000,
        })).toBe(true);
    });

    it("does not count a renewal after the trial conversion", () => {
        expect(shouldTrackFirstPaidSubscription({
            invoiceStatus: "paid",
            amountPaid: 2900,
            billingReason: "subscription_cycle",
            trialEnd: 1_800_000_000,
            servicePeriodStart: 1_802_592_000,
        })).toBe(false);
    });

    it("does not count a free or unpaid invoice as a paying customer", () => {
        expect(shouldTrackFirstPaidSubscription({
            invoiceStatus: "paid",
            amountPaid: 0,
            billingReason: "subscription_create",
            trialEnd: null,
            servicePeriodStart: 1_800_000_000,
        })).toBe(false);
    });

    it("does not count an invoice that has not been paid", () => {
        expect(shouldTrackFirstPaidSubscription({
            invoiceStatus: "open",
            amountPaid: 2900,
            billingReason: "subscription_create",
            trialEnd: null,
            servicePeriodStart: 1_800_000_000,
        })).toBe(false);
    });

    it("sends a deduplicable Subscribe event with only consented Meta cookies", async () => {
        vi.stubEnv("META_CAPI_ACCESS_TOKEN", "test-token");
        vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "123456789");
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
        vi.stubGlobal("fetch", fetchMock);

        await sendMetaPaidSubscriptionEvent({
            invoiceId: "in_sensitive_test_value",
            eventTime: 1_800_000_000,
            metadata: {
                meta_marketing_consent: "1",
                meta_fbp: "fb.1.1760900000.123456",
                meta_fbc: "fb.1.1760900000.click_123",
            },
        });

        expect(fetchMock).toHaveBeenCalledOnce();
        const [endpoint, request] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(endpoint).toBe("https://graph.facebook.com/v26.0/123456789/events");
        const body = new URLSearchParams(String(request.body));
        const [event] = JSON.parse(body.get("data") ?? "[]");
        expect(body.get("access_token")).toBe("test-token");
        expect(event).toMatchObject({
            event_name: "Subscribe",
            event_time: 1_800_000_000,
            event_id: createHash("sha256").update("in_sensitive_test_value").digest("hex"),
            action_source: "website",
            user_data: { fbp: "fb.1.1760900000.123456", fbc: "fb.1.1760900000.click_123" },
        });
        expect(JSON.stringify(event)).not.toContain("in_sensitive_test_value");
        expect(event.user_data).not.toHaveProperty("em");
        expect(event.user_data).not.toHaveProperty("ph");
        expect(event.user_data).not.toHaveProperty("client_ip_address");
    });
});
