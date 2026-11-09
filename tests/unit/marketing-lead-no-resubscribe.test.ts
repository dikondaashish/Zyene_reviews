import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

let db: FakeDb;
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: () => db.client }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));
vi.mock("@/lib/marketing/record-marketing-event", () => ({ recordMarketingEvent: vi.fn() }));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: vi.fn() }));

import { captureMarketingLead } from "@/lib/enterprise/capture-marketing-lead";
import { captureBookLead } from "@/lib/marketing/book-lead";

const UNSUBSCRIBED = "2026-10-01T00:00:00.000Z";

describe("public lead forms never re-subscribe an unsubscribed address", () => {
    beforeEach(() => {
        db = createFakeDb({ marketing_subscribers: [
            { id: "s1", email: "gone@example.com", source: "newsletter", unsubscribed_at: UNSUBSCRIBED },
        ] }, { marketing_subscribers: [["email"]] });
    });

    it("demo request / agency waitlist", async () => {
        await expect(captureMarketingLead({ email: "Gone@Example.com", source: "demo_request" })).resolves.toEqual({ ok: true });
        expect(db.tables.marketing_subscribers).toHaveLength(1);
        expect(db.tables.marketing_subscribers[0]).toMatchObject({ unsubscribed_at: UNSUBSCRIBED, source: "newsletter" });
    });

    it("homepage book download", async () => {
        await expect(captureBookLead({ email: "gone@example.com" })).resolves.toMatchObject({ ok: true });
        expect(db.tables.marketing_subscribers[0]).toMatchObject({ unsubscribed_at: UNSUBSCRIBED });
    });

    it("still adds a brand-new address", async () => {
        await captureMarketingLead({ email: "new@example.com", source: "demo_request" });
        expect(db.tables.marketing_subscribers.find((r) => r.email === "new@example.com")).toBeTruthy();
    });
});

describe("lead records keep growth attribution for subscribed people", () => {
    it("refreshes source and date for a still-subscribed address (demo KPI keeps counting)", async () => {
        db = createFakeDb({ marketing_subscribers: [
            { id: "s2", email: "fan@example.com", source: "newsletter", unsubscribed_at: null, subscribed_at: "2026-01-01T00:00:00.000Z" },
        ] });
        await captureMarketingLead({ email: "fan@example.com", source: "demo_request" });
        expect(db.tables.marketing_subscribers[0]).toMatchObject({ source: "demo_request", unsubscribed_at: null });
        expect(db.tables.marketing_subscribers[0].subscribed_at).not.toBe("2026-01-01T00:00:00.000Z");
    });
});
