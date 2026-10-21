import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ admin: vi.fn(), sendDripStep: vi.fn() }));
vi.mock("@/services/inngest/client", () => ({ inngest: { createFunction: (_c: unknown, _t: unknown, handler: unknown) => ({ handler }) } }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/campaigns/drip-step-send", () => ({ sendDripStep: mocks.sendDripStep }));
import { followUpWorker } from "@/services/inngest/sync-workers/follow-up-worker";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

const CAMPAIGN = "50000000-0000-4000-8000-000000000001";
const BIZ = "30000000-0000-4000-8000-000000000001";
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const run = (followUpWorker as unknown as { handler: (ctx: unknown) => Promise<void> }).handler;
let db: FakeDb;

function seed(campaign: Record<string, unknown>) {
    const req = (id: string, sentHoursAgo: number, extra: Record<string, unknown> = {}) => ({
        id, business_id: BIZ, campaign_id: CAMPAIGN, drip_status: "active", drip_steps_sent: 1, review_left: false,
        completed_at: null, clicked_at: null, sent_at: hoursAgo(sentHoursAgo), ...extra,
    });
    db = createFakeDb({
        campaigns: [{ id: CAMPAIGN, business_id: BIZ, status: "active", follow_up_enabled: true, follow_up_delay_hours: 24,
            stop_on_click: true, businesses: { id: BIZ, organization_id: "org" }, ...campaign }],
        review_requests: [req("due", 25), req("not-due", 23), req("clicked", 25, { clicked_at: hoursAgo(1) })],
    });
    mocks.admin.mockReturnValue(db.client);
}
const sentIds = () => mocks.sendDripStep.mock.calls.map((c) => c[0].req.id).sort();
const execute = () => run({ event: { id: "evt", data: { campaignId: CAMPAIGN } }, step: { run: async (_n: string, fn: () => Promise<unknown>) => fn() } });

describe("reminder worker timing (regression: used a fixed 7-day cutoff)", () => {
    beforeEach(() => vi.resetAllMocks());

    it("uses the campaign's reminder delay", async () => {
        seed({});
        await execute();
        expect(sentIds()).toEqual(["due"]);
    });

    it("still reminds clicked customers when stop-on-click is off", async () => {
        seed({ stop_on_click: false });
        await execute();
        expect(sentIds()).toEqual(["clicked", "due"]);
    });

    it("falls back to 7 days when no delay is set", async () => {
        seed({ follow_up_delay_hours: null });
        await execute();
        expect(sentIds()).toEqual([]);
    });
});
