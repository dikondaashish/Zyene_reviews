import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

let db: FakeDb;
const m = vi.hoisted(() => ({ send: vi.fn(), nurture: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: () => db.client }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));
vi.mock("@/lib/marketing/record-marketing-event", () => ({ recordMarketingEvent: vi.fn() }));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: m.send }));
vi.mock("@/lib/growth/schedule-growth-emails", () => ({ scheduleMarketingNurture: m.nurture }));

import { processNewsletterSubscribe } from "@/lib/marketing/newsletter-subscribe";
import { TEMPLATE_PACK_SOURCE } from "@/lib/marketing/template-pack-events";
import { LOCAL_SEO_CHECKLIST_SOURCE } from "@/lib/marketing/local-seo-checklist-events";

const GONE = "2026-10-01T00:00:00.000Z";

describe("lead-magnet forms on the newsletter endpoint", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        m.send.mockResolvedValue({ sent: true });
        db = createFakeDb({ marketing_subscribers: [{ id: "s1", email: "gone@example.com", source: "newsletter", unsubscribed_at: GONE }] });
    });

    it.each([TEMPLATE_PACK_SOURCE, LOCAL_SEO_CHECKLIST_SOURCE])("%s never re-subscribes or emails an unsubscribed address", async (source) => {
        const result = await processNewsletterSubscribe({ email: "gone@example.com", source });
        expect(result).toMatchObject({ ok: true, newLead: false });
        expect(db.tables.marketing_subscribers[0].unsubscribed_at).toBe(GONE);
        expect(m.send).not.toHaveBeenCalled();
        expect(m.nurture).not.toHaveBeenCalled();
    });

    it("the explicit newsletter sign-up still re-subscribes on request", async () => {
        await processNewsletterSubscribe({ email: "gone@example.com", source: "newsletter" });
        expect(db.tables.marketing_subscribers[0].unsubscribed_at).toBeNull();
    });
});
