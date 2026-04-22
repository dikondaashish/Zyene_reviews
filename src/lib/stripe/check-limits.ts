import { createAdminClient } from "@/lib/db/supabase/admin";
import { FREE_LIMITS, hasActiveOrTrialingStatus, planProductTier } from "@/services/stripe/plans";

interface LimitCheckResult {
    allowed: boolean;
    current: number;
    max: number; // -1 = unlimited
    remaining: number;
}

type LimitType =
    | "review_requests" // generic total (all channels)
    | "email_requests"
    | "sms_requests"
    | "link_requests"
    | "smart_replies"
    | "businesses";

/** Professional tier: per-location caps in marketing — multiply base DB limits by active locations (capped by max_businesses). */
function perLocationMultiplier(plan: string | null | undefined, businessCount: number, maxBusinesses: number): number {
    const tier = planProductTier(plan ?? undefined);
    if (tier !== "professional") {
        return 1;
    }
    const capped = Math.min(Math.max(businessCount, 0), Math.max(maxBusinesses, 1));
    return Math.max(1, capped);
}

/**
 * Check if an organization has remaining capacity for a given limit type.
 * For Professional, email/SMS/link/review totals use (base limit × active locations), capped by max_businesses.
 */
export async function checkLimit(
    organizationId: string,
    limitType: LimitType
): Promise<LimitCheckResult> {
    const supabase = createAdminClient();

    const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select(
            "plan, plan_status, max_businesses, max_review_requests_per_month, max_ai_replies_per_month, max_email_requests_per_month, max_sms_requests_per_month, max_link_requests_per_month"
        )
        .eq("id", organizationId)
        .single();

    if (orgError || !org) {
        return { allowed: false, current: 0, max: 0, remaining: 0 };
    }

    const { count: businessCountRaw } = await supabase
        .from("businesses")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId);

    const businessCount = businessCountRaw ?? 0;
    const subscriptionIsActive = hasActiveOrTrialingStatus(org.plan_status ?? null);
    const maxBiz = subscriptionIsActive ? (org.max_businesses ?? 1) : FREE_LIMITS.maxLocations;
    const mult = perLocationMultiplier(org.plan, businessCount, maxBiz);

    // Determine the max for this limit type
    let max: number;
    switch (limitType) {
        case "businesses":
            max = maxBiz;
            break;
        case "email_requests":
            max = subscriptionIsActive
                ? (org.max_email_requests_per_month ?? org.max_review_requests_per_month ?? 100)
                : FREE_LIMITS.emailRequestsPerMonth;
            if (max !== -1) max *= mult;
            break;
        case "sms_requests":
            max = subscriptionIsActive
                ? (org.max_sms_requests_per_month ?? org.max_review_requests_per_month ?? 100)
                : FREE_LIMITS.smsRequestsPerMonth;
            if (max !== -1) max *= mult;
            break;
        case "link_requests":
            max = subscriptionIsActive
                ? (org.max_link_requests_per_month ?? org.max_review_requests_per_month ?? 100)
                : FREE_LIMITS.linkRequestsPerMonth;
            if (max !== -1) max *= mult;
            break;
        case "review_requests": {
            const base = subscriptionIsActive
                ? (org.max_review_requests_per_month ?? 100)
                : (FREE_LIMITS.emailRequestsPerMonth + FREE_LIMITS.smsRequestsPerMonth + FREE_LIMITS.linkRequestsPerMonth);
            max = base;
            if (max !== -1) max *= mult;
            break;
        }
        case "smart_replies":
            max = subscriptionIsActive
                ? (org.max_ai_replies_per_month ?? 0)
                : FREE_LIMITS.smartRepliesPerMonth;
            break;
        default:
            max = 0;
    }

    // -1 means unlimited
    if (max === -1) {
        return { allowed: true, current: 0, max: -1, remaining: 999999 };
    }

    // Count current usage
    let current = 0;

    if (limitType === "businesses") {
        current = businessCount;
    } else {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: businesses } = await supabase
            .from("businesses")
            .select("id")
            .eq("organization_id", organizationId);

        const businessIds = businesses?.map((b: { id: string }) => b.id) || [];

        if (businessIds.length === 0) {
            const calculatedMax = max > 0 ? max : 0;
            return { allowed: max > 0, current: 0, max, remaining: calculatedMax };
        }

        if (limitType === "smart_replies") {
            const { count } = await supabase
                .from("review_requests")
                .select("*", { count: "exact", head: true })
                .in("business_id", businessIds)
                .not("ai_review_text", "is", null)
                .gte("created_at", startOfMonth.toISOString());

            current = count || 0;
        } else {
            let query = supabase
                .from("review_requests")
                .select("*", { count: "exact", head: true })
                .in("business_id", businessIds)
                .gte("created_at", startOfMonth.toISOString());

            if (limitType === "email_requests") {
                query = query.eq("channel", "email");
            } else if (limitType === "sms_requests") {
                query = query.eq("channel", "sms");
            } else if (limitType === "link_requests") {
                query = query.eq("channel", "link");
            }

            const { count } = await query;
            current = count || 0;
        }
    }

    return {
        allowed: current < max,
        current,
        max,
        remaining: Math.max(0, max - current),
    };
}
