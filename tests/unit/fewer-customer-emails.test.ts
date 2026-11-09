import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ send: vi.fn(), planStatus: vi.fn(), run: vi.fn() }));
vi.mock("@/services/inngest/client", () => ({
    inngest: { createFunction: (_config: unknown, _event: unknown, handler: unknown) => handler },
}));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: m.send }));
vi.mock("@/lib/db/supabase/admin", () => ({
    createAdminClient: () => ({
        from: (table: string) => {
            const query: Record<string, unknown> = {};
            for (const k of ["select", "eq", "is", "update"]) query[k] = () => query;
            query.maybeSingle = async () =>
                table === "organizations" ? { data: { plan_status: m.planStatus() }, error: null } : { data: m.run(), error: null };
            query.then = (resolve: (v: unknown) => void) => resolve({ error: null });
            return query;
        },
    }),
}));

import { TRIAL_NURTURE_STEPS } from "@/lib/campaign-content/email-sequences-data";
import { isAlertWorthyReview } from "@/lib/notifications/review-alert";
import { trialNurtureWorker } from "@/services/inngest/growth-functions";

type Step = { sleep: () => Promise<void>; run: <T>(key: string, fn: () => Promise<T>) => Promise<T> };
const run = trialNurtureWorker as unknown as (args: { event: { data: Record<string, string> }; step: Step }) => Promise<void>;
const execute = () =>
    run({
        event: { data: { email: "owner@example.test", userName: "Sam", dashboardUrl: "https://app.example.test", organizationId: "org-1" } },
        step: { sleep: async () => {}, run: async (_key, fn) => fn() },
    });

beforeEach(() => {
    vi.clearAllMocks();
    m.send.mockResolvedValue({ sent: true });
    m.run.mockReturnValue({ id: "run-1", status: "active" });
});

describe("trial tips", () => {
    it("are two emails: day 2 and day 7", () => {
        expect(TRIAL_NURTURE_STEPS.map((s) => s.key)).toEqual(["trial_day2_first_request", "trial_day7_upgrade"]);
    });

    it("send both tips while the organization is still trialing", async () => {
        m.planStatus.mockReturnValue("trialing");
        await execute();
        expect(m.send).toHaveBeenCalledTimes(2);
    });

    it("stop as soon as the organization pays", async () => {
        m.planStatus.mockReturnValueOnce("trialing").mockReturnValue("active");
        await execute();
        expect(m.send).toHaveBeenCalledTimes(1);
        expect(m.send.mock.calls[0][0].subject).toBe("Day 2: Send your first review request");
    });
});

describe("new-review alerts", () => {
    it.each([
        [5, 2, false],
        [4, undefined, false],
        [3, 7, true],
        [2, undefined, true],
        [1, 1, true],
        [null, 9, true],
    ])("rating %s with urgency %s alerts: %s", (rating, urgency, expected) => {
        expect(isAlertWorthyReview(rating, urgency)).toBe(expected);
    });
});
