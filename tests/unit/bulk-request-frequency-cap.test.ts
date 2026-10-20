import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ sms: vi.fn(), limit: vi.fn(), admin: vi.fn() }));
vi.mock("@/services/twilio/send-sms", () => ({ sendSMS: mocks.sms }));
vi.mock("@/lib/stripe/check-limits", () => ({ checkLimit: mocks.limit }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
import { runBulkReviewRequestAction } from "@/services/customers/bulk-request-action";
import type { SupabaseClient } from "@supabase/supabase-js";

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
const customer = (id: string, lastSent: string | null) => ({ id, first_name: "Sam", last_name: null, phone: `+1555555${id}`,
    is_opted_out: false, tags: [], total_requests_sent: 1, last_request_sent_at: lastSent });

function supabase(capDays: number | null, customers: ReturnType<typeof customer>[]) {
    return { from: (table: string) => {
        const query: Record<string, unknown> = {};
        Object.assign(query, { select: () => query, eq: () => query, in: () => query, update: () => query, insert: () => query,
            single: async () => table === "businesses"
                ? { data: { id: "business-a", name: "Acme", slug: "acme", review_request_frequency_cap_days: capDays,
                    organizations: { id: "org-a", plan: "pro" } } }
                : { data: { id: "request-a" }, error: null },
            then: (resolve: (value: unknown) => unknown) =>
                Promise.resolve(table === "customers" ? { data: customers } : { data: [{ id: "request-a" }] }).then(resolve) });
        return query;
    } } as unknown as SupabaseClient;
}

describe("bulk review request frequency cap", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic-tracking-secret");
        mocks.limit.mockResolvedValue({ allowed: true, remaining: 100 });
        mocks.sms.mockResolvedValue({ sent: true, error: null });
        mocks.admin.mockReturnValue({ from: () => ({ update: () => ({ eq: () => ({ eq: async () => ({}) }) }) }) });
    });

    it("skips customers asked within the business frequency cap", async () => {
        const result = await runBulkReviewRequestAction(supabase(30, [customer("0101", daysAgo(5)), customer("0102", daysAgo(45)),
            customer("0103", null)]), "business-a", ["0101", "0102", "0103"]);
        expect(result.status).toBe(200);
        expect(mocks.sms).toHaveBeenCalledTimes(2);
        expect(mocks.sms.mock.calls.map(call => call[0])).not.toContain("+15555550101");
        expect(result.body).toMatchObject({ sent: 2, skipped: 1, skippedIds: ["0101"] });
    });

    it("defaults to a 30-day cap and rejects when every contact is capped", async () => {
        const result = await runBulkReviewRequestAction(supabase(null, [customer("0101", daysAgo(29))]), "business-a", ["0101"]);
        expect(result.status).toBe(400);
        expect(mocks.sms).not.toHaveBeenCalled();
    });
});
