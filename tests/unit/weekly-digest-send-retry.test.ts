import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ admin: vi.fn(), access: vi.fn(), email: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({ userCanAccessBusiness: mocks.access }));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: mocks.email }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() } }));
vi.mock("@/services/inngest/client", () => ({
    inngest: { createFunction: (_c: unknown, _t: unknown, handler: unknown) => ({ handler }) },
}));

import { NonRetriableError } from "inngest";
import { weeklyDigestWorker } from "@/services/inngest/sync-workers/weekly-digest-worker";

type Run = <T>(name: string, cb: () => Promise<T>) => Promise<T>;
type Ctx = { event: { id?: string; data: { businessId: string } }; step: { run: Run } };
const handler = (weeklyDigestWorker as unknown as { handler: (ctx: Ctx) => Promise<void> }).handler;
const digest = {
    businessName: "Biz",
    emailHtml: "<p>digest</p>",
    recipients: [{ userId: "u1", email: "u1@example.test" }, { userId: "u2", email: "u2@example.test" }],
};

/**
 * Inngest-like step runner. A successful step is memoised. A failing step with
 * retries left halts the execution (the SDK never resolves that step.run, so
 * the handler's catch does not see it); the function is then re-executed. On
 * the final attempt, or for a NonRetriableError, the error reaches the handler.
 */
function memoStep(maxAttempts = 3) {
    const done = new Map<string, unknown>();
    const attempts = new Map<string, number>();
    let halt: () => void = () => undefined;
    const run: Run = async (name, cb) => {
        if (name === "build-digest") return digest as never;
        if (done.has(name)) return done.get(name) as never;
        const attempt = (attempts.get(name) ?? 0) + 1;
        attempts.set(name, attempt);
        try {
            const value = await cb();
            done.set(name, value);
            return value;
        } catch (err) {
            if (err instanceof NonRetriableError || attempt >= maxAttempts) throw err;
            halt();
            return new Promise<never>(() => undefined);
        }
    };
    /** Runs one execution; resolves "halted" when a step asks for a retry. */
    const execute = (ctx: Ctx) => new Promise<"halted" | "completed">((resolve, reject) => {
        halt = () => resolve("halted");
        ctx.step = { run };
        handler(ctx).then(() => resolve("completed"), reject);
    });
    /** Re-executes until the function completes, like Inngest's retries. */
    const runToCompletion = async (ctx: Ctx) => {
        for (let i = 0; i < 20; i++) if ((await execute(ctx)) === "completed") return i + 1;
        throw new Error("never completed");
    };
    return { run, done, attempts, execute, runToCompletion };
}

const sentTo = () => mocks.email.mock.calls.map((c) => (c[0] as { to: string }).to);
const ctxFor = (step: { run: Run }): Ctx => ({ event: { id: "evt-1", data: { businessId: "b1" } }, step });

beforeEach(() => {
    vi.resetAllMocks();
    mocks.admin.mockReturnValue({});
    mocks.access.mockResolvedValue(true);
});

describe("weekly digest per-recipient send", () => {
    it("retries only the failed recipient when sendEmail reports sent: false", async () => {
        mocks.email
            .mockResolvedValueOnce({ sent: true, id: "e1" })
            .mockResolvedValueOnce({ sent: false, error: "429" })
            .mockResolvedValueOnce({ sent: true, id: "e2" });
        const step = memoStep();
        const ctx = ctxFor(step);
        expect(await step.execute(ctx)).toBe("halted");
        expect(step.done.has("send-digest-u1")).toBe(true);
        expect(step.done.has("send-digest-u2")).toBe(false);
        expect(await step.execute(ctx)).toBe("completed");
        expect(sentTo()).toEqual(["u1@example.test", "u2@example.test", "u2@example.test"]);
        const keys = mocks.email.mock.calls.map((c) => (c[0] as { idempotencyKey?: string }).idempotencyKey);
        expect(keys).toEqual(["weekly-digest/evt-1/u1", "weekly-digest/evt-1/u2", "weekly-digest/evt-1/u2"]);
    });

    it("still sends later recipients after one recipient fails permanently", async () => {
        mocks.email.mockImplementation(async ({ to }: { to: string }) =>
            to === "u1@example.test" ? { sent: false, error: "Invalid `to` field" } : { sent: true, id: "e2" });
        const step = memoStep(3);
        await step.runToCompletion(ctxFor(step));
        expect(step.attempts.get("send-digest-u1")).toBe(3);
        expect(step.done.has("send-digest-u2")).toBe(true);
        expect(sentTo().filter((t) => t === "u2@example.test")).toHaveLength(1);
    });

    it("does not retry a missing API key and still moves on", async () => {
        mocks.email.mockResolvedValue({ sent: false, error: "RESEND_API_KEY is not set on the server" });
        const step = memoStep(3);
        expect(await step.runToCompletion(ctxFor(step))).toBe(1);
        expect(step.attempts.get("send-digest-u1")).toBe(1);
        expect(step.attempts.get("send-digest-u2")).toBe(1);
    });

    it("completes when every send is accepted", async () => {
        mocks.email.mockResolvedValue({ sent: true, id: "ok" });
        const step = memoStep();
        expect(await step.execute({ event: { data: { businessId: "b1" } }, step })).toBe("completed");
        expect(mocks.email).toHaveBeenCalledTimes(2);
    });
});
