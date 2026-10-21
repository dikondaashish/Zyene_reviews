import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ lock: vi.fn(), release: vi.fn(), process: vi.fn(), admin: vi.fn(),
    prepare: vi.fn(), sendPrepared: vi.fn() }));
vi.mock("@/services/inngest/client", () => ({ inngest: { createFunction: (_c: unknown, _t: unknown, handler: unknown) => ({ handler }) } }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/db/redis-lock", () => ({ acquireLock: mocks.lock, releaseLock: mocks.release }));
vi.mock("@/lib/review-requests/process-scheduled-queue", () => ({ processOneScheduled: mocks.process }));
vi.mock("@/lib/review-requests/process-scheduled-one-prep", () => ({ prepareScheduledSendRow: mocks.prepare }));
vi.mock("@/lib/review-requests/process-scheduled-one-send", () => ({ sendPreparedScheduledRow: mocks.sendPrepared }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
import { processScheduledReviewRequest } from "@/services/inngest/functions/process-scheduled-review-request-function";
import { processOneScheduled as realProcessOne } from "@/lib/review-requests/process-scheduled-one";
import type { SupabaseClient } from "@supabase/supabase-js";

type Step = { run: <T>(name: string, cb: () => Promise<T>) => Promise<T>; sleepUntil: ReturnType<typeof vi.fn> };
const execute = (processScheduledReviewRequest as unknown as {
    handler: (ctx: { event: { data: { reviewRequestId: string; sendAt: string } }; step: Step }) => Promise<{ status: string }>;
}).handler;
const row = { id: "request-a", business_id: "business-a", customer_name: null, customer_phone: "+15555550100",
    customer_email: null, channel: "sms", status: "queued" };

describe("scheduled review request timing", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        mocks.lock.mockResolvedValue(true);
        mocks.process.mockResolvedValue("sent");
        const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: row }) };
        mocks.admin.mockReturnValue({ from: () => query });
    });

    it("sleeps with a top-level step (never nested in step.run) before sending", async () => {
        const order: string[] = [];
        let insideRun = false;
        const step: Step = {
            run: async (name, cb) => { order.push(name); insideRun = true; try { return await cb(); } finally { insideRun = false; } },
            sleepUntil: vi.fn(async () => { expect(insideRun).toBe(false); order.push("sleep"); }),
        };
        const sendAt = "2030-01-01T10:00:00.000Z";
        await execute({ event: { data: { reviewRequestId: "request-a", sendAt } }, step });
        expect(step.sleepUntil).toHaveBeenCalledWith("scheduled-wait", new Date(sendAt));
        expect(order[0]).toBe("sleep");
        expect(order.indexOf("sleep")).toBeLessThan(order.indexOf("send-scheduled"));
    });

    it("only claims rows whose scheduled_for has passed", async () => {
        const or = vi.fn();
        const query = { update: vi.fn(() => query), eq: vi.fn(() => query), or: or.mockImplementation(() => query),
            select: () => query, maybeSingle: async () => ({ data: null, error: null }) };
        const admin = { from: () => query } as unknown as SupabaseClient;
        expect(await realProcessOne(admin, row)).toBe("skipped");
        expect(or).toHaveBeenCalledWith(expect.stringMatching(/^scheduled_for\.is\.null,scheduled_for\.lte\.\d{4}-\d{2}-\d{2}T/));
        expect(mocks.prepare).not.toHaveBeenCalled();
    });
});
