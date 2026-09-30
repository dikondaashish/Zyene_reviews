import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReviewAlertPayload } from "@/types/notifications";
const mocks = vi.hoisted(() => ({ admin: vi.fn(), access: vi.fn(), email: vi.fn(), sms: vi.fn(), update: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({ userCanAccessBusiness: mocks.access }));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: mocks.email }));
vi.mock("@/services/twilio/send-sms", () => ({ sendSMS: mocks.sms }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("@/services/inngest/client", () => ({ inngest: { createFunction: (_config: unknown, _trigger: unknown, handler: unknown) => ({ handler }) } }));

import { sendReviewAlert } from "@/lib/notifications/review-alert";
import { weeklyDigestWorker } from "@/services/inngest/sync-workers/weekly-digest-worker";
const members = ["owner", "foreign", "sibling-only", "suspended", "removed"];
const hostileText = '<a href="https://attacker.example.test/">Phishing</a>';
const review = { id: "review-a", business_id: "business-a", rating: 1, author_name: hostileText,
    text: hostileText, urgency_score: 9, customer_email: null, customer_phone: null } as ReviewAlertPayload;
type Context = { event: { data: { businessId: string } }; step: { run: <T>(name: string, callback: () => Promise<T>) => Promise<T> } };
const digestHandler = (weeklyDigestWorker as unknown as { handler: (ctx: Context) => Promise<void> }).handler;
const runDigest = () => digestHandler({ event: { data: { businessId: "business-a" } }, step: { run: async (_name, callback) => callback() } });

beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.example.test");
    mocks.access.mockImplementation(async (_client, userId: string) => userId === "owner");
    mocks.email.mockResolvedValue({ success: true }); mocks.sms.mockResolvedValue({ success: true });
    mocks.admin.mockReturnValue({ from: (table: string) => {
        let head = false;
        const query = {
            select: (_columns: string, options?: { head?: boolean }) => { head = !!options?.head; return query; },
            eq: () => query, in: () => query, gte: () => query, is: () => query,
            update: mocks.update.mockImplementation(() => query),
            single: async () => result(),
            then: (resolve: (value: unknown) => unknown) => Promise.resolve(result()).then(resolve),
        };
        function result() {
            if (table === "businesses") return { data: { id: "business-a", name: "Business A", organization_id: "org-a", timezone: "UTC" }, error: null };
            if (table === "organization_members") return { data: members.map(user_id => ({ user_id, role: user_id === "owner" ? "ORG_OWNER" : "ORG_EMPLOYEE", users: { email: `${user_id}@example.test` } })), error: null };
            if (table === "notification_preferences") return { data: members.map(user_id => ({ user_id, email_enabled: true, digest_enabled: true, sms_enabled: true, sms_phone_number: "+15555550100", users: { email: `${user_id}@example.test` } })), error: null };
            return { data: head ? null : [{ ...review }], count: head ? 1 : null, error: null };
        }
        return query;
    } });
});
afterEach(() => vi.unstubAllEnvs());

describe.each([["review alerts", () => sendReviewAlert(review)], ["weekly digests", runDigest]] as const)("%s recipient scope", (_name, send) => {
    it.each(["foreign", "sibling-only", "suspended", "removed"])("cannot send business content to %s users", async userId => {
        mocks.access.mockResolvedValue(false);
        await send();
        expect(mocks.access).toHaveBeenCalledWith(expect.anything(), userId, "business-a");
        expect(mocks.email).not.toHaveBeenCalled(); expect(mocks.sms).not.toHaveBeenCalled();
        expect(mocks.update).not.toHaveBeenCalled();
    });
    it("preserves owner delivery and keeps unauthorized business-only members out", async () => {
        await send();
        expect(mocks.email).toHaveBeenCalledTimes(1);
        expect(mocks.email).toHaveBeenCalledWith(expect.objectContaining({ to: "owner@example.test" }));
        expect(mocks.email.mock.calls[0][0].html).not.toContain(hostileText);
        expect(mocks.email.mock.calls[0][0].html).toContain("&lt;a");
    });
    it("does not send through an authorization lookup failure", async () => {
        mocks.access.mockRejectedValue(new Error("Synthetic auth outage"));
        await expect(send()).rejects.toThrow("Synthetic auth outage");
        expect(mocks.email).not.toHaveBeenCalled(); expect(mocks.sms).not.toHaveBeenCalled();
    });
});

it("revalidates cached digest recipients immediately before each provider call", async () => {
    mocks.access.mockResolvedValue(false);
    await digestHandler({ event: { data: { businessId: "business-a" } }, step: {
        run: async <T>(name: string, callback: () => Promise<T>) => name === "build-digest"
            ? { businessName: "Business A", emailHtml: "Private digest", recipients: [{ userId: "sibling-only", email: "sibling-only@example.test" }] } as T
            : callback(),
    } });
    expect(mocks.access).toHaveBeenCalledWith(expect.anything(), "sibling-only", "business-a");
    expect(mocks.email).not.toHaveBeenCalled();
});
