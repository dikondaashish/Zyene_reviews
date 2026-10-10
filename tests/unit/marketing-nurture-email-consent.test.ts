import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ send: vi.fn(), lookup: vi.fn() }));
vi.mock("@/services/inngest/client", () => ({ inngest: { createFunction: (_config: unknown, _event: unknown, handler: unknown) => handler } }));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: mocks.send }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: () => ({ from: () => {
    const query = { select: () => query, eq: () => query, maybeSingle: mocks.lookup, update: () => query };
    return query;
} }) }));
import { marketingNurtureWorker } from "@/services/inngest/growth-functions";

// The mocked Inngest factory exposes the same registered handler without network calls.
const run = marketingNurtureWorker as unknown as (args: {
    event: { data: { email: string } }; step: { sleep: () => Promise<void>; run: (key: string, fn: () => Promise<void>) => Promise<void> };
}) => Promise<void>;
const execute = () => run({ event: { data: { email: "customer@example.test" } },
    step: { sleep: async () => {}, run: async (_key, fn) => fn() } });

beforeEach(() => { vi.clearAllMocks(); mocks.send.mockResolvedValue({ sent: true }); });
describe("marketing nurture recipient controls", () => {
    it("includes the actual subscriber's unsubscribe link in every step", async () => {
        mocks.lookup.mockResolvedValue({ data: { id: "synthetic-id", unsubscribed_at: null }, error: null });
        await execute();
        expect(mocks.send).toHaveBeenCalledTimes(3);
        for (const [message] of mocks.send.mock.calls) expect(message.html).toContain("/newsletter/unsubscribe?id=synthetic-id");
    });
    it.each([null, { id: "synthetic-id", unsubscribed_at: "2026-10-10" }])("skips removed or unsubscribed leads", async data => {
        mocks.lookup.mockResolvedValue({ data, error: null });
        await execute();
        expect(mocks.send).not.toHaveBeenCalled();
    });
    it("checks consent again after each delay", async () => {
        mocks.lookup.mockResolvedValueOnce({ data: { id: "synthetic-id", unsubscribed_at: null }, error: null })
            .mockResolvedValue({ data: { id: "synthetic-id", unsubscribed_at: "2026-10-10" }, error: null });
        await execute();
        expect(mocks.send).toHaveBeenCalledTimes(1);
    });
    it("sends nothing if the subscription check fails", async () => {
        mocks.lookup.mockResolvedValue({ data: null, error: { message: "Unavailable" } });
        await expect(execute()).rejects.toThrow("Unable to check marketing subscription");
        expect(mocks.send).not.toHaveBeenCalled();
    });
});
