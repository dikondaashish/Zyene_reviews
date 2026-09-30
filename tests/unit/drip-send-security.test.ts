import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DripCampaignRow, DripRequestRow } from "@/lib/campaigns/drip-phase1-types";
const mocks = vi.hoisted(() => ({ reserve: vi.fn(), send: vi.fn(), permission: vi.fn(), eq: vi.fn(), update: vi.fn(), error: vi.fn() }));
vi.mock("@/lib/stripe/reserve-channel-usage", () => ({ reserveChannelUsage: mocks.reserve }));
vi.mock("@/lib/notifications/review-request", () => ({ sendReviewRequest: mocks.send }));
vi.mock("@/services/campaigns/campaign-job-access", () => ({ campaignContactPermission: mocks.permission }));
vi.mock("@/lib/logger", () => ({ logger: { warn: vi.fn(), error: mocks.error } }));
import { sendDripStep } from "@/lib/campaigns/drip-step-send";
import type { createAdminClient } from "@/lib/db/supabase/admin";

const campaign = { id: "campaign-a", business_id: "business-a", status: "active", follow_up_enabled: true,
    follow_up_template: null, drip_step3_template: null, drip_channel_alternate: true, channel: "email",
    businesses: { id: "business-a", organization_id: "org-a", name: "Business A", sender_name: null } };
const request = { id: "request-a", business_id: "business-a", campaign_id: "campaign-a", customer_name: "Customer",
    customer_email: "synthetic@example.test", customer_phone: "+15555550100", drip_status: "active", drip_steps_sent: 1,
    review_left: false, clicked_at: null, completed_at: null, last_drip_channel: "email", sent_at: null, step2_sent_at: null };
let liveCampaign = { ...campaign };
let liveRequest = { ...request };
let databaseError: Error | null = null;
function admin() {
    return { from: (table: string) => {
        const query = { select: () => query, eq: mocks.eq.mockImplementation(() => query),
            update: mocks.update.mockImplementation(() => query),
            single: async () => ({ data: liveCampaign, error: databaseError }),
            maybeSingle: async () => ({ data: table === "campaigns" ? liveCampaign : liveRequest, error: databaseError }),
            then: (resolve: (value: unknown) => unknown) => Promise.resolve({ error: databaseError }).then(resolve) };
        return query;
    } } as unknown as ReturnType<typeof createAdminClient>;
}
function args(deliveryId = "cron-a") {
    return { admin: admin(), campaign: campaign as DripCampaignRow, req: request as DripRequestRow,
        step: 2 as const, deliveryId };
}
describe("drip tenant binding and send-time allowance", () => {
    beforeEach(() => {
        vi.resetAllMocks(); liveCampaign = { ...campaign }; liveRequest = { ...request }; databaseError = null;
        mocks.reserve.mockResolvedValue(true); mocks.permission.mockResolvedValue({ allowed: true });
        mocks.send.mockResolvedValue({ emailSent: false, smsSent: true, error: null });
    });
    it("reserves SMS for an email-to-SMS alternating follow-up using only the live organization", async () => {
        await sendDripStep(args());
        expect(mocks.reserve).toHaveBeenCalledWith("org-a", ["sms"], "drip:request-a:step:2:job:cron-a");
        expect(mocks.send).toHaveBeenCalledTimes(1);
        expect(mocks.eq).toHaveBeenCalledWith("business_id", "business-a");
        expect(mocks.eq).toHaveBeenCalledWith("campaign_id", "campaign-a");
    });
    it("denies a zero/free SMS allowance before provider calls", async () => {
        mocks.reserve.mockResolvedValue(false);
        await sendDripStep(args());
        expect(mocks.send).not.toHaveBeenCalled(); expect(mocks.update).not.toHaveBeenCalled();
    });
    it("fails closed on Redis or database errors", async () => {
        mocks.reserve.mockRejectedValue(new Error("Synthetic Redis outage"));
        await sendDripStep(args()); expect(mocks.send).not.toHaveBeenCalled();
        mocks.reserve.mockResolvedValue(true); databaseError = new Error("Synthetic database outage");
        await sendDripStep(args()); expect(mocks.send).not.toHaveBeenCalled();
    });
    it.each(["business_id", "campaign_id"] as const)("denies a reparented request with another %s", async key => {
        liveRequest = { ...liveRequest, [key]: "foreign" };
        await sendDripStep(args());
        expect(mocks.reserve).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled();
    });
    it("denies a sibling/foreign request supplied to this campaign before provider work", async () => {
        await sendDripStep({ ...args(), req: { ...request, business_id: "foreign" } as DripRequestRow });
        expect(mocks.reserve).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled();
    });
    it("denies mismatched resource IDs even if a malformed database adapter returns a row", async () => {
        liveRequest = { ...request, id: "foreign-request" };
        await sendDripStep(args()); expect(mocks.send).not.toHaveBeenCalled();
        liveRequest = { ...request }; liveCampaign = { ...campaign, id: "foreign-campaign" };
        await sendDripStep(args()); expect(mocks.send).not.toHaveBeenCalled();
    });
    it.each(["paused", "draft"])("does not send after campaign status changes to %s", async status => {
        liveCampaign = { ...liveCampaign, status };
        await sendDripStep(args()); expect(mocks.send).not.toHaveBeenCalled();
    });
    it("does not send when follow-ups are disabled or contact consent is revoked", async () => {
        liveCampaign = { ...liveCampaign, follow_up_enabled: false };
        await sendDripStep(args()); expect(mocks.send).not.toHaveBeenCalled();
        liveCampaign = { ...campaign }; mocks.permission.mockResolvedValue({ allowed: false });
        await sendDripStep(args()); expect(mocks.send).not.toHaveBeenCalled();
    });
    it.each(["clicked_at", "completed_at"] as const)("rechecks fresh stop field %s", async field => {
        liveRequest = { ...liveRequest, [field]: "2026-09-30T12:00:00Z" };
        await sendDripStep(args()); expect(mocks.send).not.toHaveBeenCalled();
    });
    it("does not repeat a step that was already advanced", async () => {
        liveRequest = { ...liveRequest, drip_steps_sent: 2 };
        await sendDripStep(args()); expect(mocks.send).not.toHaveBeenCalled();
    });
    it("charges a new cron occurrence separately, while a retry retains its claim", async () => {
        await sendDripStep(args("cron-a")); await sendDripStep(args("cron-a")); await sendDripStep(args("cron-b"));
        expect(mocks.reserve.mock.calls.map(call => call[2])).toEqual([
            "drip:request-a:step:2:job:cron-a", "drip:request-a:step:2:job:cron-a", "drip:request-a:step:2:job:cron-b",
        ]);
    });
});
