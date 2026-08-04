/**
 * Plan eligibility and monthly quota gate for AI review drafts.
 *
 * Any failure here denies the draft — the whole check is wrapped so a lookup
 * error can never be read as "allowed".
 */
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/supabase/database.types";
import { planAllowsAiReviewFeatures } from "@/services/stripe/plans";

const PLAN_REQUIRED = {
    error: "AI review draft requires an eligible paid plan.",
    code: "AI_REVIEW_DRAFT_PLAN_REQUIRED",
} as const;

const UNLIMITED = -1;
const ACTIVE_STATUSES = ["active", "trialing"];

/** A denial response, or null when the draft is allowed. */
export type QuotaDenial = NextResponse | null;

function startOfCurrentMonth(): Date {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

/** Counts AI drafts already generated this month across the org's businesses. */
async function countDraftsUsedThisMonth(
    supabase: SupabaseClient<Database>,
    orgId: string,
): Promise<number | null> {
    const { data: orgBusinesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("organization_id", orgId);

    const businessIds = (orgBusinesses ?? []).map((b: { id: string }) => b.id);
    if (businessIds.length === 0) return null;

    const { count } = await supabase
        .from("review_requests")
        .select("*", { count: "exact", head: true })
        .in("business_id", businessIds)
        .not("ai_review_text", "is", null)
        .gte("created_at", startOfCurrentMonth().toISOString());

    return count ?? 0;
}

/**
 * Denies the request when the org's plan does not include AI review drafts, or
 * when it has spent its monthly allowance. Regenerating a draft for a request
 * that already has one does not consume additional quota.
 */
export async function checkAiReviewDraftQuota(
    supabase: SupabaseClient<Database>,
    businessId: string,
    reviewRequestId: string | undefined,
): Promise<QuotaDenial> {
    try {
        const { data: biz } = await supabase
            .from("businesses")
            .select("organization_id, organizations!inner(plan, plan_status, max_ai_replies_per_month)")
            .eq("id", businessId)
            .maybeSingle();

        const org =
            (biz as {
                organizations?: {
                    plan?: string | null;
                    plan_status?: string | null;
                    max_ai_replies_per_month?: number | null;
                };
            } | null)?.organizations ?? null;
        const orgId = (biz as { organization_id?: string | null } | null)?.organization_id ?? null;
        const maxDrafts =
            typeof org?.max_ai_replies_per_month === "number" ? org.max_ai_replies_per_month : 0;
        const planStatus = typeof org?.plan_status === "string" ? org.plan_status : null;

        if (!planAllowsAiReviewFeatures(org?.plan ?? null, org?.plan_status ?? null)) {
            return NextResponse.json(
                {
                    error: "AI review draft requires an active Starter, Professional, or Enterprise plan.",
                    code: PLAN_REQUIRED.code,
                },
                { status: 403 },
            );
        }

        let alreadyGenerated = false;
        if (reviewRequestId) {
            const { data: existingDraft } = await supabase
                .from("review_requests")
                .select("id")
                .eq("id", reviewRequestId)
                .not("ai_review_text", "is", null)
                .maybeSingle();
            alreadyGenerated = Boolean(existingDraft?.id);
        }

        const quotaApplies =
            orgId !== null &&
            maxDrafts !== UNLIMITED &&
            planStatus !== null &&
            ACTIVE_STATUSES.includes(planStatus);

        if (quotaApplies && !alreadyGenerated) {
            const used = await countDraftsUsedThisMonth(supabase, orgId);
            if (used !== null && used >= maxDrafts) {
                return NextResponse.json(
                    {
                        error: "Monthly AI review draft limit reached for your plan.",
                        code: "AI_REVIEW_DRAFT_LIMIT_REACHED",
                        limit: maxDrafts,
                    },
                    { status: 429 },
                );
            }
        }

        return null;
    } catch {
        return NextResponse.json(PLAN_REQUIRED, { status: 403 });
    }
}

export { PLAN_REQUIRED };
