import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
const mocks = vi.hoisted(() => ({ quota: vi.fn(), eval: vi.fn(), eq: vi.fn(), row: vi.fn() }));
vi.mock("@/lib/stripe/check-limits", () => ({ checkLimit: mocks.quota }));
vi.mock("@/lib/db/redis", () => ({ redis: { eval: mocks.eval } }));
import { reserveChannelUsage } from "@/lib/stripe/reserve-channel-usage";
import { checkCampaignAudienceQuota } from "@/services/campaigns/campaign-send-quota";

describe("campaign quota scope and atomic reservations", () => {
    const client = () => {
        const query = { select: () => query, eq: mocks.eq.mockImplementation(() => query), single: mocks.row };
        return { from: () => query } as unknown as SupabaseClient<Database>;
    };
    beforeEach(() => {
        vi.resetAllMocks();
        vi.useRealTimers();
        mocks.row.mockResolvedValue({ data: { organization_id: "org-a" }, error: null });
        mocks.quota.mockResolvedValue({ allowed: true, current: 3, max: 10, remaining: 7 });
        mocks.eval.mockResolvedValue(1);
    });
    it("uses the authorized business's organization, never a caller-supplied organization", async () => {
        expect(await checkCampaignAudienceQuota(client(), "business-a", "sms", [{ phone: "synthetic" }])).toBe(true);
        expect(mocks.eq).toHaveBeenCalledWith("id", "business-a");
        expect(mocks.quota).toHaveBeenCalledWith("org-a", "sms_requests");
    });
    it("denies a missing/foreign business before privileged quota reads", async () => {
        mocks.row.mockResolvedValue({ data: null, error: null });
        expect(await checkCampaignAudienceQuota(client(), "foreign-business", "sms", [{ phone: "synthetic" }])).toBe(false);
        expect(mocks.quota).not.toHaveBeenCalled();
    });
    it("denies an audience larger than either remaining channel allowance", async () => {
        mocks.quota.mockResolvedValue({ allowed: true, current: 9, max: 10, remaining: 1 });
        expect(await checkCampaignAudienceQuota(client(), "business-a", "both", [
            { phone: "one", email: "one@example.test" }, { phone: "two", email: "two@example.test" },
        ])).toBe(false);
    });
    it("binds all channels and the retry claim to the server-derived tenant and UTC month", async () => {
        vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-01T00:00:00Z"));
        expect(await reserveChannelUsage("org-a", ["sms", "email", "sms"], "job-a")).toBe(true);
        expect(mocks.eval).toHaveBeenCalledWith(expect.any(String), [
            "outbound-usage:{org-a}:2026-10:email", "outbound-usage:{org-a}:2026-10:sms",
            expect.stringMatching(/^outbound-usage:\{org-a\}:2026-10:claim:[a-f0-9]{64}$/),
        ], [3, 10, 3, 10, 45 * 86400]);
        vi.useRealTimers();
    });
    it("does not reserve zero-capacity/free SMS or send through a storage outage", async () => {
        mocks.quota.mockResolvedValue({ allowed: false, current: 0, max: 0, remaining: 0 });
        expect(await reserveChannelUsage("org-a", ["sms"], "job-a")).toBe(false);
        expect(mocks.eval).not.toHaveBeenCalled();
        mocks.quota.mockResolvedValue({ allowed: true, current: 0, max: 10, remaining: 10 });
        mocks.eval.mockRejectedValue(new Error("Synthetic Redis outage"));
        await expect(reserveChannelUsage("org-a", ["sms"], "job-a")).rejects.toThrow("Synthetic Redis outage");
    });
    it("separates retry claims for another tenant and another month", async () => {
        await reserveChannelUsage("org-a", ["sms"], "job-a");
        await reserveChannelUsage("org-b", ["sms"], "job-a");
        expect(mocks.eval.mock.calls[0][1]).not.toEqual(mocks.eval.mock.calls[1][1]);
    });
    it.each([Number.NaN, -1, 0.5, Number.POSITIVE_INFINITY])("fails closed on malformed usage %s", async current => {
        mocks.quota.mockResolvedValue({ allowed: true, current, max: 10, remaining: 10 });
        expect(await reserveChannelUsage("org-a", ["sms"], "job-a")).toBe(false);
        expect(mocks.eval).not.toHaveBeenCalled();
    });
});
