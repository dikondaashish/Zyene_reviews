import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ admin: vi.fn(), user: vi.fn(), access: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/logger", () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock("@/app/api/_shared/auth", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({ userCanAccessBusiness: mocks.access }));
import { recordReviewRequestOpenForRef } from "@/lib/review-requests/record-review-request-open";
import { POST as trackReview } from "@/app/api/track/review/route";
import { handleConfirmReview } from "@/services/review-requests/confirm-review-api";
import { signReviewTracking } from "@/lib/review-requests/tracking-token";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

const BIZ = "30000000-0000-4000-8000-000000000001";
const OTHER = "30000000-0000-4000-8000-000000000002";
const REQ = "40000000-0000-4000-8000-000000000001";
const CAMPAIGN = "50000000-0000-4000-8000-000000000001";
let db: FakeDb;
const row = () => db.tables.review_requests[0];

beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic-secret");
    db = createFakeDb({
        review_requests: [{ id: REQ, business_id: BIZ, campaign_id: CAMPAIGN, status: "sent", opened_at: null, clicked_at: null,
            drip_status: "active", review_confirmed_at: null, review_confirmation_source: null, review_left: false }],
        campaigns: [{ id: CAMPAIGN, business_id: BIZ, stop_on_click: true }],
    });
    mocks.admin.mockReturnValue(db.client);
    mocks.user.mockResolvedValue({ supabase: {}, user: { id: "user-a" } });
});

describe("link opens are clicks, not reviews", () => {
    it("keeps the first open/click time on repeat visits and stops reminders when stop-on-click is on", async () => {
        await recordReviewRequestOpenForRef({ businessId: BIZ, requestId: REQ });
        const first = row().clicked_at;
        await new Promise((r) => setTimeout(r, 5));
        await recordReviewRequestOpenForRef({ businessId: BIZ, requestId: REQ });
        expect(row()).toMatchObject({ status: "clicked", clicked_at: first, opened_at: first, drip_status: "terminated", drip_terminated_reason: "clicked" });
        expect(row().review_confirmed_at).toBeNull();
    });

    it("keeps reminders running after a click when the campaign turned stop-on-click off", async () => {
        db.tables.campaigns[0].stop_on_click = false;
        await recordReviewRequestOpenForRef({ businessId: BIZ, requestId: REQ });
        expect(row()).toMatchObject({ status: "clicked", drip_status: "active" });
    });

    it("never moves a rated or finished request back to clicked", async () => {
        row().status = "rated_positive";
        await recordReviewRequestOpenForRef({ businessId: BIZ, requestId: REQ });
        expect(row().status).toBe("rated_positive");
    });
});

describe("review page progress", () => {
    const post = (status: string, extra: Record<string, unknown> = {}) => trackReview(new Request("https://x.test/api/track/review", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", requestId: REQ, businessId: BIZ, token: signReviewTracking(REQ, BIZ), trackData: { status, ...extra } }),
    }));

    it("moves forward only and stamps the server time for finishing the page", async () => {
        expect((await post("completed", { completed_at: "2000-01-01T00:00:00.000Z" })).status).toBe(200);
        expect(row().status).toBe("completed");
        expect(String(row().completed_at) > "2026").toBe(true);
        await post("rated_positive");
        expect(row().status).toBe("completed");
        // Finishing the page is not a confirmed review.
        expect(row().review_confirmed_at).toBeNull();
    });

    it("rejects a token for another request", async () => {
        const response = await trackReview(new Request("https://x.test/api/track/review", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "update", requestId: REQ, businessId: BIZ, token: signReviewTracking("40000000-0000-4000-8000-000000000009", BIZ), trackData: { status: "completed" } }),
        }));
        expect(response.status).toBe(403);
    });
});

describe("manual review confirmation", () => {
    const confirm = (confirmed: boolean, id = REQ) => handleConfirmReview(new Request("https://x.test", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmed }),
    }), id);

    it("is recorded as manual, stops reminders and can be undone", async () => {
        mocks.access.mockResolvedValue(true);
        expect((await confirm(true)).status).toBe(200);
        expect(row()).toMatchObject({ review_confirmation_source: "manual", review_confirmed_by: "user-a", review_left: true, drip_status: "terminated", drip_terminated_reason: "review_left" });
        expect((await confirm(false)).status).toBe(200);
        expect(row()).toMatchObject({ review_confirmed_at: null, review_confirmation_source: null });
    });

    it("returns 404 for another business's request and changes nothing", async () => {
        db.tables.review_requests[0].business_id = OTHER;
        mocks.access.mockImplementation(async (_c: unknown, _u: string, businessId: string) => businessId === BIZ);
        expect((await confirm(true)).status).toBe(404);
        expect(row().review_confirmed_at).toBeNull();
    });

    it("requires write access (viewers cannot confirm)", async () => {
        mocks.access.mockImplementation(async (_c: unknown, _u: string, _b: string, write?: boolean) => !write);
        expect((await confirm(true)).status).toBe(404);
        expect(mocks.access).toHaveBeenCalledWith(expect.anything(), "user-a", BIZ, true);
    });
});
