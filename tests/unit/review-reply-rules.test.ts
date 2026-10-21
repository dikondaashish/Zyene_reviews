import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ admin: vi.fn(), user: vi.fn(), access: vi.fn(), manage: vi.fn(), post: vi.fn() }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: mocks.admin }));
vi.mock("@/lib/logger", () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock("@/app/api/_shared/auth", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/db/supabase/verify-business-access", () => ({ userCanAccessBusiness: mocks.access }));
vi.mock("@/lib/auth/manage-business-integration", () => ({ canManageBusinessIntegration: mocks.manage }));
vi.mock("@/services/reviews/post-google-reply-system", () => ({ postGoogleReplySystem: mocks.post }));
import { evaluateAutoReplyGate } from "@/services/reviews/auto-reply-gate";
import { renderReplyTemplate, queueReplyDraft } from "@/services/reviews/reply-rules";
import { handleDecideReplyApproval } from "@/services/reviews/reply-approvals-api";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";

const BIZ = "30000000-0000-4000-8000-000000000001";
const DRAFT = "60000000-0000-4000-8000-000000000001";
let db: FakeDb;
const now = Date.parse("2026-10-21T12:00:00Z");
function business(overrides: Record<string, unknown> = {}) {
    return { id: BIZ, name: "Juniper", category: "cafe", organization_id: "org", auto_reply_enabled: false, auto_reply_enabled_at: null,
        auto_reply_min_rating: 4, auto_reply_tone: "friendly", reply_rules_enabled: true, reply_rules_enabled_at: "2026-10-20T00:00:00Z",
        organizations: { id: "org", plan: "starter_monthly", plan_status: "active" }, ...overrides };
}
function seed(rating: number, biz = business()) {
    db = createFakeDb({
        reviews: [{ id: "review-a", rating, text: "Nice", author_name: "Pat Lee", response_status: "pending", platform: "google",
            review_date: "2026-10-21T10:00:00Z", selected_staff: null, businesses: biz }],
        review_reply_rules: [], review_reply_templates: [], review_reply_drafts: [], review_reply_approvers: [],
    }, { review_reply_drafts: [["review_id"]] });
    mocks.admin.mockReturnValue(db.client);
}

describe("reply rules by star rating", () => {
    beforeEach(() => vi.resetAllMocks());

    it("defaults every rating to approval when no rule is saved (nothing posts on its own)", async () => {
        seed(1);
        expect(await evaluateAutoReplyGate(db.client, "review-a", now)).toMatchObject({ ok: true, rule: { action: "approval" } });
    });

    it("routes by the saved rule: ignore, auto and template", async () => {
        seed(5);
        db.tables.review_reply_rules.push({ business_id: BIZ, rating: 5, action: "ignore" });
        expect(await evaluateAutoReplyGate(db.client, "review-a", now)).toEqual({ ok: false, reason: "rule_ignore" });
        db.tables.review_reply_rules[0].action = "auto";
        expect(await evaluateAutoReplyGate(db.client, "review-a", now)).toMatchObject({ ok: true, rule: { action: "auto" } });
        db.tables.review_reply_templates.push({ id: "t1", business_id: BIZ, body: "Thanks {reviewer_name}!" });
        Object.assign(db.tables.review_reply_rules[0], { action: "template", template_id: "t1" });
        expect(await evaluateAutoReplyGate(db.client, "review-a", now)).toMatchObject({ ok: true, rule: { action: "template", templateBody: "Thanks {reviewer_name}!" } });
    });

    it("falls back to approval when a template rule's template is gone", async () => {
        seed(4);
        db.tables.review_reply_rules.push({ business_id: BIZ, rating: 4, action: "template", template_id: "missing" });
        expect(await evaluateAutoReplyGate(db.client, "review-a", now)).toMatchObject({ ok: true, rule: { action: "approval" } });
    });

    it("never auto-posts without the auto-reply plan", async () => {
        seed(5, business({ organizations: { id: "org", plan: "starter_monthly", plan_status: "canceled" } }));
        db.tables.review_reply_rules.push({ business_id: BIZ, rating: 5, action: "auto" });
        expect(await evaluateAutoReplyGate(db.client, "review-a", now)).toEqual({ ok: false, reason: "plan_not_eligible" });
    });

    it("keeps the legacy single-threshold behaviour when rules are off", async () => {
        seed(3, business({ reply_rules_enabled: false, auto_reply_enabled: true, auto_reply_enabled_at: "2026-10-20T00:00:00Z" }));
        expect(await evaluateAutoReplyGate(db.client, "review-a", now)).toEqual({ ok: false, reason: "rating_below_threshold" });
    });

    it("skips reviews that are already answered or older than the rules switch", async () => {
        seed(5);
        db.tables.reviews[0].response_status = "responded";
        expect((await evaluateAutoReplyGate(db.client, "review-a", now)).ok).toBe(false);
        seed(5, business({ reply_rules_enabled_at: "2026-10-21T11:00:00Z" }));
        expect(await evaluateAutoReplyGate(db.client, "review-a", now)).toEqual({ ok: false, reason: "review_before_auto_reply_enabled" });
    });

    it("renders templates with the reviewer's first name only", () => {
        expect(renderReplyTemplate("Thanks {reviewer_name} from {business_name}!", { reviewerName: "Pat Lee", businessName: "Juniper" }))
            .toBe("Thanks Pat from Juniper!");
    });

    it("queues at most one draft per review", async () => {
        seed(2);
        expect(await queueReplyDraft(db.client, { businessId: BIZ, reviewId: "review-a", rating: 2, text: "Sorry", source: "ai" })).toBeTruthy();
        expect(await queueReplyDraft(db.client, { businessId: BIZ, reviewId: "review-a", rating: 2, text: "Again", source: "ai" })).toBeNull();
        expect(db.tables.review_reply_drafts).toHaveLength(1);
    });
});

describe("reply approvals", () => {
    const decide = (body: Record<string, unknown>) => handleDecideReplyApproval(new Request("https://x.test", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }), DRAFT);
    beforeEach(() => {
        vi.resetAllMocks();
        seed(2);
        db.tables.review_reply_drafts.push({ id: DRAFT, business_id: BIZ, review_id: "review-a", draft_text: "We're sorry", status: "pending" });
        mocks.user.mockResolvedValue({ supabase: {}, user: { id: "user-a" } });
        mocks.access.mockResolvedValue(true);
        mocks.manage.mockResolvedValue(true);
        mocks.post.mockResolvedValue(true);
    });

    it("posts the (edited) reply once; a second click cannot post again", async () => {
        expect((await decide({ action: "approve", text: "We're sorry, please call us." })).status).toBe(200);
        expect(mocks.post).toHaveBeenCalledWith("review-a", "We're sorry, please call us.", { approved: true });
        expect(db.tables.review_reply_drafts[0]).toMatchObject({ status: "posted", decided_by: "user-a" });
        expect((await decide({ action: "approve" })).status).toBe(409);
        expect(mocks.post).toHaveBeenCalledTimes(1);
    });

    it("only designated approvers may decide when approvers are set", async () => {
        db.tables.review_reply_approvers.push({ business_id: BIZ, user_id: "user-b" });
        expect((await decide({ action: "approve" })).status).toBe(403);
        expect(mocks.post).not.toHaveBeenCalled();
    });

    it("requires a manager when no approvers are set", async () => {
        mocks.manage.mockResolvedValue(false);
        expect((await decide({ action: "reject" })).status).toBe(403);
        expect(db.tables.review_reply_drafts[0].status).toBe("pending");
    });

    it("hides drafts of other businesses (404) and does not overwrite an existing reply", async () => {
        mocks.access.mockResolvedValue(false);
        expect((await decide({ action: "approve" })).status).toBe(404);
        mocks.access.mockResolvedValue(true);
        mocks.post.mockResolvedValue(false);
        expect((await decide({ action: "approve" })).status).toBe(200);
        expect(db.tables.review_reply_drafts[0].status).toBe("superseded");
    });

    it("marks a Google failure as retryable", async () => {
        mocks.post.mockRejectedValue(new Error("Google 500"));
        expect((await decide({ action: "approve" })).status).toBe(502);
        expect(db.tables.review_reply_drafts[0].status).toBe("failed");
        mocks.post.mockResolvedValue(true);
        expect((await decide({ action: "approve" })).status).toBe(200);
    });
});
