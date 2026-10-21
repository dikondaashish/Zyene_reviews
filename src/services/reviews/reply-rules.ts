import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Per-star reply rules. A missing rule means "approval" (the safe default): a person must
 * approve every reply unless the owner explicitly chose to post automatically.
 */
export type ReplyRuleAction = "approval" | "auto" | "template" | "ignore";
export const REPLY_RULE_ACTIONS: ReplyRuleAction[] = ["approval", "auto", "template", "ignore"];

export type ResolvedReplyRule =
    | { action: "ignore" }
    | { action: "auto" }
    | { action: "approval"; templateBody: string | null }
    | { action: "template"; templateBody: string };

export async function resolveReplyRule(admin: SupabaseClient, businessId: string, rating: number): Promise<ResolvedReplyRule> {
    const { data: rule, error } = await admin.from("review_reply_rules")
        .select("action, template_id").eq("business_id", businessId).eq("rating", rating).maybeSingle();
    if (error) throw error;
    const action = (rule?.action ?? "approval") as ReplyRuleAction;
    if (action === "ignore" || action === "auto") return { action };

    let templateBody: string | null = null;
    if (rule?.template_id) {
        const { data: template } = await admin.from("review_reply_templates")
            .select("body").eq("business_id", businessId).eq("id", rule.template_id).maybeSingle();
        templateBody = (template?.body as string | undefined) ?? null;
    }
    // A template rule whose template was deleted falls back to approval.
    if (action === "template" && templateBody) return { action: "template", templateBody };
    return { action: "approval", templateBody };
}

export function renderReplyTemplate(body: string, values: { reviewerName?: string | null; businessName?: string | null }): string {
    const firstName = (values.reviewerName || "").trim().split(/\s+/)[0] || "there";
    return body
        .replace(/\{reviewer_name\}/g, firstName)
        .replace(/\{business_name\}/g, (values.businessName || "our team").trim())
        .trim()
        .slice(0, 4096);
}

/**
 * Queue a draft for approval. One draft per review (unique review_id), so re-runs of the job
 * cannot create a second pending reply. Returns the draft id when newly created.
 */
export async function queueReplyDraft(admin: SupabaseClient, args: {
    businessId: string; reviewId: string; rating: number; text: string; source: "ai" | "template";
}): Promise<string | null> {
    const { data, error } = await admin.from("review_reply_drafts").insert({
        business_id: args.businessId, review_id: args.reviewId, rating: args.rating,
        draft_text: args.text.slice(0, 4096), source: args.source, status: "pending",
    }).select("id").single();
    if (error?.code === "23505") return null;
    if (error) throw error;
    return data.id as string;
}

/** Who may approve: designated approvers if any are set, otherwise owners/admins/managers. */
export async function listDesignatedApprovers(admin: SupabaseClient, businessId: string): Promise<string[]> {
    const { data, error } = await admin.from("review_reply_approvers").select("user_id").eq("business_id", businessId);
    if (error) throw error;
    return (data ?? []).map((row) => row.user_id as string);
}
