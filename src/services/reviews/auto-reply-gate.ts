import type { SupabaseClient } from "@supabase/supabase-js";
import { planAllowsAutoCommenter } from "@/services/stripe/plans";
import type { ReplyTone } from "@/domains/ai/services/generate-reply-draft";
import { AUTO_REPLY_ENABLED_AT_SKEW_MS, AUTO_REPLY_MAX_REVIEW_AGE_MS } from "@/services/reviews/auto-reply-eligibility";
import { resolveReplyRule, type ResolvedReplyRule } from "@/services/reviews/reply-rules";

const AUTO_REPLY_TONES: ReplyTone[] = ["professional", "friendly", "concise"];

type GateBusiness = {
    id: string; name: string | null; category: string | null; organization_id: string;
    auto_reply_enabled: boolean; auto_reply_enabled_at: string | null; auto_reply_min_rating: number; auto_reply_tone: string;
    reply_rules_enabled: boolean | null; reply_rules_enabled_at: string | null;
    organizations: { id: string; plan: string | null; plan_status: string | null } | null;
};

export type AutoReplyGate =
    | { ok: false; reason: string }
    | {
        ok: true; orgId: string; businessId: string; tone: ReplyTone; businessName: string; businessCategory: string;
        plan: string | null | undefined; rating: number; reviewText: string; reviewerName: string | null;
        selectedStaff: string[] | null; rule: ResolvedReplyRule; aiAllowed: boolean;
    };

/**
 * Decides whether and how to reply to one Google review. With reply rules on, the rule for
 * the star rating decides (approval by default); otherwise the legacy single-threshold
 * auto-reply settings apply unchanged.
 */
export async function evaluateAutoReplyGate(admin: SupabaseClient, reviewId: string, now = Date.now()): Promise<AutoReplyGate> {
    const { data: row, error } = await admin.from("reviews").select(`
        id, rating, text, author_name, response_status, platform, review_date, selected_staff,
        businesses!inner ( id, name, category, organization_id, auto_reply_enabled, auto_reply_enabled_at,
            auto_reply_min_rating, auto_reply_tone, reply_rules_enabled, reply_rules_enabled_at,
            organizations!inner ( id, plan, plan_status ) )`).eq("id", reviewId).single();
    if (error || !row) return { ok: false, reason: "review_not_found" };
    if (row.platform !== "google" || row.response_status !== "pending") return { ok: false, reason: "not_eligible_state" };

    const biz = row.businesses as unknown as GateBusiness;
    const rulesOn = Boolean(biz?.reply_rules_enabled);
    if (!rulesOn && !biz?.auto_reply_enabled) return { ok: false, reason: "auto_reply_disabled" };
    const enabledAtRaw = rulesOn ? biz.reply_rules_enabled_at : biz.auto_reply_enabled_at;
    if (!enabledAtRaw) return { ok: false, reason: "auto_reply_no_cutoff" };
    const rating = row.rating as number;
    if (!rulesOn && rating < biz.auto_reply_min_rating) return { ok: false, reason: "rating_below_threshold" };

    const reviewedAt = row.review_date ? new Date(row.review_date as string) : null;
    if (!reviewedAt || Number.isNaN(reviewedAt.getTime())) return { ok: false, reason: "bad_review_date" };
    if (now - reviewedAt.getTime() > AUTO_REPLY_MAX_REVIEW_AGE_MS) return { ok: false, reason: "review_too_old" };
    const enabledAt = new Date(enabledAtRaw);
    if (Number.isNaN(enabledAt.getTime())) return { ok: false, reason: "bad_auto_reply_enabled_at" };
    if (reviewedAt.getTime() < enabledAt.getTime() - AUTO_REPLY_ENABLED_AT_SKEW_MS) return { ok: false, reason: "review_before_auto_reply_enabled" };

    const rule: ResolvedReplyRule = rulesOn ? await resolveReplyRule(admin, biz.id, rating) : { action: "auto" };
    if (rule.action === "ignore") return { ok: false, reason: "rule_ignore" };
    const aiAllowed = planAllowsAutoCommenter(biz.organizations?.plan, biz.organizations?.plan_status);
    // Posting without a person (auto or saved template) needs the auto-reply plan.
    if ((rule.action === "auto" || rule.action === "template") && !aiAllowed) return { ok: false, reason: "plan_not_eligible" };
    if (rule.action === "approval" && !aiAllowed && !rule.templateBody) return { ok: false, reason: "plan_not_eligible" };

    const tone = (AUTO_REPLY_TONES.includes(biz.auto_reply_tone as ReplyTone) ? biz.auto_reply_tone : "professional") as ReplyTone;
    return {
        ok: true, orgId: biz.organization_id, businessId: biz.id, tone,
        businessName: biz.name || "our business", businessCategory: (biz.category || "local").trim() || "local",
        plan: biz.organizations?.plan, rating, reviewText: (row.text as string) || "",
        reviewerName: (row.author_name as string | null) ?? null, selectedStaff: row.selected_staff as string[] | null,
        rule, aiAllowed,
    };
}
