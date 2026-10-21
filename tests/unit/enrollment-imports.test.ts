import { beforeEach, describe, expect, it, vi } from "vitest";
import { Webhook } from "svix";
const mocks = vi.hoisted(() => ({ send: vi.fn(), admin: vi.fn() }));
vi.mock("@/services/inngest/client", () => ({ inngest: { send: mocks.send } }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/logger", () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));
import { summarizeImportRows, validateImportRows } from "@/lib/enrollment/validate-import-rows";
import { runEnrollmentImports } from "@/services/enrollment/run-enrollment-imports";
import { inboundToken, pickCustomerRecipients, senderAllowed, splitAddressList } from "@/lib/enrollment/inbound-email-parse";
import { handleResendInbound } from "@/services/webhooks/resend-inbound";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

const BIZ = "30000000-0000-4000-8000-000000000001";
const CAMPAIGN = "50000000-0000-4000-8000-000000000001";
let db: FakeDb;

describe("CSV validation and dedupe", () => {
    it("normalizes, rejects unusable rows with reasons, and de-duplicates by email or phone", () => {
        const rows = validateImportRows([
            { name: "Sam", email: "Sam@Example.test", phone: "(555) 555-0100" },
            { name: "Sam again", email: "sam@example.test" },
            { name: "Same phone", phone: "555-555-0100" },
            { name: "No contact" },
            { name: "Bad email", email: "not-an-email", phone: "5555550199" },
        ], "both");
        expect(rows.map((r) => r.status)).toEqual(["pending", "duplicate", "duplicate", "invalid", "pending"]);
        expect(rows[0]).toMatchObject({ email: "sam@example.test", phone: "+15555550100", identityKey: "sam@example.test" });
        expect(rows[4].reason).toBe("Email address is not valid");
        expect(summarizeImportRows(rows)).toEqual({ total: 5, valid: 2, invalid: 1, duplicate: 2 });
    });

    it("requires the contact type the campaign actually sends", () => {
        expect(validateImportRows([{ email: "a@example.test" }], "sms")[0]).toMatchObject({ status: "invalid", reason: expect.stringContaining("phone") });
    });
});

describe("daily enrollment runner", () => {
    function seed(status = "active", dailyLimit = 2, pending = 5, enrolledToday = 0) {
        const rows = Array.from({ length: pending }, (_, i) => ({ id: `row-${i}`, import_id: "imp-1", row_number: i + 1, status: "pending",
            customer_name: `C${i}`, email: `c${i}@example.test`, phone: null }));
        for (let i = 0; i < enrolledToday; i++) rows.push({ id: `done-${i}`, import_id: "imp-1", row_number: 100 + i, status: "enrolled", processed_at: new Date().toISOString() } as never);
        db = createFakeDb({
            enrollment_imports: [{ id: "imp-1", business_id: BIZ, campaign_id: CAMPAIGN, source: "csv", status: "active", daily_limit: dailyLimit,
                created_by: "user-a", campaigns: { status }, businesses: { timezone: "America/New_York" } }],
            enrollment_import_rows: rows,
        });
    }
    beforeEach(() => vi.resetAllMocks());

    it("enrolls up to the daily limit with stable event ids, through the campaign worker", async () => {
        seed();
        const summary = await runEnrollmentImports(db.client);
        expect(summary.enrolled).toBe(2);
        const events = mocks.send.mock.calls[0][0];
        expect(events.map((e: { id: string }) => e.id)).toEqual(["import:imp-1:row:row-0", "import:imp-1:row:row-1"]);
        expect(events[0]).toMatchObject({ name: "campaign/send.contact", data: { campaignId: CAMPAIGN, userId: "user-a", importRowId: "row-0" } });
        expect(db.tables.enrollment_import_rows.filter((r) => r.status === "enrolled")).toHaveLength(2);
    });

    it("counts what was already enrolled today and never enrolls a row twice on overlapping runs", async () => {
        seed("active", 3, 5, 2);
        await runEnrollmentImports(db.client);
        await runEnrollmentImports(db.client);
        const sent = mocks.send.mock.calls.flatMap((c) => c[0]);
        expect(sent).toHaveLength(1);
        expect(new Set(sent.map((e: { id: string }) => e.id)).size).toBe(sent.length);
    });

    it("waits (without using the limit) while the campaign is paused, and pauses cleanly", async () => {
        seed("paused");
        expect((await runEnrollmentImports(db.client)).waiting).toBe(1);
        expect(mocks.send).not.toHaveBeenCalled();
        seed();
        db.tables.enrollment_imports[0].status = "paused";
        expect((await runEnrollmentImports(db.client)).imports).toBe(0);
    });

    it("finishes a CSV import when no rows are left", async () => {
        seed("active", 10, 2);
        await runEnrollmentImports(db.client);
        expect(db.tables.enrollment_imports[0].status).toBe("completed");
    });
});

describe("invoice-copy email enrollment", () => {
    const SECRET = `whsec_${Buffer.from("synthetic-inbound-secret-123456").toString("base64")}`;
    const TOKEN = "a1b2c3d4e5f6a7b8c9d0e1f2";
    function signed(payload: unknown) {
        const body = JSON.stringify(payload);
        const id = `msg_${Math.random().toString(36).slice(2)}`;
        const ts = new Date();
        const signature = new Webhook(SECRET).sign(id, ts, body);
        return new Request("https://x.test/api/webhooks/resend-inbound", { method: "POST", body,
            headers: { "svix-id": id, "svix-timestamp": String(Math.floor(ts.getTime() / 1000)), "svix-signature": signature } });
    }
    const event = (id: string, from: string, to: string[], cc: string[] = []) => ({ type: "email.received", data: { email_id: id, from, to, cc, subject: "Invoice #1", text: "secret" } });

    beforeEach(() => {
        vi.resetAllMocks();
        vi.stubEnv("RESEND_INBOUND_WEBHOOK_SECRET", SECRET);
        vi.stubEnv("INBOUND_EMAIL_DOMAIN", "in.collectratings.test");
        vi.stubEnv("RESEND_API_KEY", "");
        vi.unstubAllGlobals();
        db = createFakeDb({
            inbound_email_events: [], enrollment_imports: [], enrollment_import_rows: [],
            business_inbound_addresses: [{ business_id: BIZ, address_token: TOKEN, enabled: true, campaign_id: CAMPAIGN,
                allowed_senders: ["billing@shop.test", "@invoicer.test"], updated_by: "user-a" }],
            campaigns: [{ id: CAMPAIGN, business_id: BIZ, status: "active" }],
            businesses: [{ id: BIZ, organization_id: "org", email: "owner@shop.test" }],
            organization_members: [{ organization_id: "org", users: { email: "manager@gmail.test" } }],
            business_members: [],
        }, { inbound_email_events: [["provider_event_id"]], enrollment_import_rows: [["import_id", "identity_key"]] });
        mocks.admin.mockReturnValue(db.client);
    });

    it("parses tokens, allowed senders and customer recipients", () => {
        expect(inboundToken(`reviews-${TOKEN}@in.collectratings.test`, "in.collectratings.test")).toBe(TOKEN);
        expect(inboundToken(`reviews-${TOKEN}@evil.test`, "in.collectratings.test")).toBeNull();
        expect(senderAllowed("ops@invoicer.test", ["@invoicer.test"])).toBe(true);
        expect(senderAllowed("ops@sub.invoicer.test", ["@invoicer.test"])).toBe(false);
        expect(pickCustomerRecipients(["Pat Lee <pat@customer.test>", "colleague@shop.test", "manager@gmail.test", "noreply@x.test"], {
            inboundDomain: "in.collectratings.test", senderEmail: "billing@shop.test", allowedSenders: [], excludedEmails: ["manager@gmail.test"],
        })).toEqual([{ email: "pat@customer.test", name: "Pat Lee" }]);
    });

    it("rejects unsigned events", async () => {
        const request = new Request("https://x.test", { method: "POST", body: JSON.stringify(event("e1", "billing@shop.test", [])) });
        expect((await handleResendInbound(request)).status).toBe(401);
        expect(db.tables.inbound_email_events).toEqual([]);
    });

    it("enrolls only the customer, stores no invoice content, and processes each event once", async () => {
        const payload = event("e1", "Billing <billing@shop.test>", ["Pat Lee <pat@customer.test>", "manager@gmail.test"], [`reviews-${TOKEN}@in.collectratings.test`]);
        expect((await handleResendInbound(signed(payload))).status).toBe(200);
        expect((await (await handleResendInbound(signed(payload))).json())).toMatchObject({ duplicate: true });
        expect(db.tables.enrollment_import_rows).toEqual([expect.objectContaining({ email: "pat@customer.test", customer_name: "Pat Lee", status: "pending" })]);
        expect(db.tables.enrollment_imports[0]).toMatchObject({ source: "inbound_email", campaign_id: CAMPAIGN });
        expect(JSON.stringify(db.tables)).not.toMatch(/Invoice #1|secret/);
    });

    it("ignores senders that are not allowed and repeat customers from later invoices", async () => {
        await handleResendInbound(signed(event("e2", "random@spam.test", [`reviews-${TOKEN}@in.collectratings.test`, "pat@customer.test"])));
        expect(db.tables.inbound_email_events[0]).toMatchObject({ status: "rejected", reason: "Sender is not on the allowed list" });
        await handleResendInbound(signed(event("e3", "billing@shop.test", ["pat@customer.test", `reviews-${TOKEN}@in.collectratings.test`])));
        await handleResendInbound(signed(event("e4", "billing@shop.test", ["pat@customer.test", `reviews-${TOKEN}@in.collectratings.test`])));
        expect(db.tables.enrollment_import_rows).toHaveLength(1);
        expect(db.tables.inbound_email_events.find((e) => e.provider_event_id === "e4")).toMatchObject({ status: "ignored" });
    });

    it("splits address-list headers without breaking quoted names", () => {
        expect(splitAddressList("\"Lee, Pat\" <pat@customer.test>, sam@customer.test; <x@y.test>"))
            .toEqual(["\"Lee, Pat\" <pat@customer.test>", "sam@customer.test", "<x@y.test>"]);
        expect(splitAddressList(undefined)).toEqual([]);
    });

    it("reads the customer from the original To/Cc headers when the payload lists only our address", async () => {
        vi.stubEnv("RESEND_API_KEY", "re_test");
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
            headers: { to: "\"Pat Lee\" <pat@customer.test>", cc: `<reviews-${TOKEN}@in.collectratings.test>` },
        })));
        vi.stubGlobal("fetch", fetchMock);
        const inbound = `reviews-${TOKEN}@in.collectratings.test`;
        expect((await handleResendInbound(signed(event("e5", "billing@shop.test", [inbound], [inbound])))).status).toBe(200);
        expect(fetchMock).toHaveBeenCalledWith("https://api.resend.com/emails/receiving/e5", expect.anything());
        expect(db.tables.enrollment_import_rows).toEqual([expect.objectContaining({ email: "pat@customer.test", customer_name: "Pat Lee" })]);
        expect(db.tables.inbound_email_events[0]).toMatchObject({ status: "enrolled", enrolled: 1 });
    });

    it("releases the event for retry when the header lookup fails", async () => {
        vi.stubEnv("RESEND_API_KEY", "re_test");
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 503 })));
        const inbound = `reviews-${TOKEN}@in.collectratings.test`;
        expect((await handleResendInbound(signed(event("e6", "billing@shop.test", [inbound])))).status).toBe(500);
        expect(db.tables.inbound_email_events).toEqual([]);
    });
});
