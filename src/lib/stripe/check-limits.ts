import { createAdminClient } from "@/lib/supabase/admin";

interface LimitCheckResult {
    allowed: boolean;
    current: number;
    max: number; // -1 = unlimited
}

type LimitType =
    | "review_requests"      // generic total (all channels)
    | "email_requests"
    | "sms_requests"
    | "link_requests"
    | "ai_replies"
    | "businesses";

/**
 * Check if an organization has remaining capacity for a given limit type.
 * For per-location plans, the limit is multiplied by the number of active businesses.
 */
export async function checkLimit(
    organizationId: string,
    limitType: LimitType
): Promise<LimitCheckResult> {
    const supabase = createAdminClient();

    // Get the organization's plan limits
    const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select(
            "plan, max_businesses, max_review_requests_per_month, max_ai_replies_per_month, max_email_requests_per_month, max_sms_requests_per_month, max_link_requests_per_month"
        )
        .eq("id", organizationId)
        .single();

    if (orgError || !org) {
        return { allowed: false, current: 0, max: 0 };
    }

    // Determine the max for this limit type
    let max: number;
    switch (limitType) {
        case "businesses":
            max = org.max_businesses ?? 1;
            break;
        case "email_requests":
            max = org.max_email_requests_per_month ?? org.max_review_requests_per_month ?? 100;
            break;
        case "sms_requests":
            max = org.max_sms_requests_per_month ?? org.max_review_requests_per_month ?? 100;
            break;
        case "link_requests":
            max = org.max_link_requests_per_month ?? org.max_review_requests_per_month ?? 100;
            break;
        case "review_requests":
            // Generic total — sum of all channel limits or fallback
            max = org.max_review_requests_per_month ?? 100;
            break;
        case "ai_replies":
            max = org.max_ai_replies_per_month ?? 0;
            break;
        default:
            max = 0;
    }

    // -1 means unlimited
    if (max === -1) {
        return { allowed: true, current: 0, max: -1 };
    }

    // Count current usage
    let current = 0;

    if (limitType === "businesses") {
        const { count } = await supabase
            .from("businesses")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", organizationId);

        current = count || 0;
    } else {
        // For monthly limits, count this month's usage
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // Get business IDs for this organization
        const { data: businesses } = await supabase
            .from("businesses")
            .select("id")
            .eq("organization_id", organizationId);

        const businessIds = businesses?.map((b: { id: string }) => b.id) || [];

        if (businessIds.length === 0) {
            return { allowed: max > 0, current: 0, max };
        }

        if (limitType === "ai_replies") {
            const { count } = await supabase
                .from("reviews")
                .select("*", { count: "exact", head: true })
                .in("business_id", businessIds)
                .eq("response_status", "responded")
                .gte("responded_at", startOfMonth.toISOString());

            current = count || 0;
        } else {
            // review_requests filtered by channel
            let query = supabase
                .from("review_requests")
                .select("*", { count: "exact", head: true })
                .in("business_id", businessIds)
                .gte("created_at", startOfMonth.toISOString());

            // Filter by channel for specific limit types
            if (limitType === "email_requests") {
                query = query.eq("channel", "email");
            } else if (limitType === "sms_requests") {
                query = query.eq("channel", "sms");
            } else if (limitType === "link_requests") {
                query = query.eq("channel", "link");
            }
            // "review_requests" = no channel filter (all channels)

            const { count } = await query;
            current = count || 0;
        }
    }

    return {
        allowed: current < max,
        current,
        max,
    };
}
