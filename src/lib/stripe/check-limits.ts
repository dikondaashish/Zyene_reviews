import { createAdminClient } from "@/lib/supabase/admin";

interface LimitCheckResult {
    allowed: boolean;
    current: number;
    max: number;
}

/**
 * Check if an organization has remaining capacity for a given limit type.
 * Returns { allowed, current, max } where max = -1 means unlimited.
 */
export async function checkLimit(
    organizationId: string,
    limitType: "review_requests" | "ai_replies" | "businesses"
): Promise<LimitCheckResult> {
    const supabase = createAdminClient();

    // Get the organization's plan limits
    const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select(
            "plan, max_businesses, max_review_requests_per_month, max_ai_replies_per_month"
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
            max = org.max_businesses;
            break;
        case "review_requests":
            max = org.max_review_requests_per_month;
            break;
        case "ai_replies":
            max = org.max_ai_replies_per_month;
            break;
    }

    // -1 means unlimited
    if (max === -1) {
        return { allowed: true, current: 0, max: -1 };
    }

    // Count current usage
    let current = 0;

    if (limitType === "businesses") {
        // Count businesses in the organization
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

        if (limitType === "review_requests") {
            const { count } = await supabase
                .from("review_requests")
                .select("*", { count: "exact", head: true })
                .in("business_id", businessIds)
                .gte("created_at", startOfMonth.toISOString());

            current = count || 0;
        } else if (limitType === "ai_replies") {
            // Count reviews that had AI replies generated this month
            const { count } = await supabase
                .from("reviews")
                .select("*", { count: "exact", head: true })
                .in("business_id", businessIds)
                .eq("response_status", "responded")
                .gte("responded_at", startOfMonth.toISOString());

            current = count || 0;
        }
    }

    return {
        allowed: current < max,
        current,
        max,
    };
}
