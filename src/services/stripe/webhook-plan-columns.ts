import type { PlanLimits } from "@/services/stripe/plans";

/**
 * Translates a plan's limits into the organizations table's quota columns.
 * Both the checkout and cancellation handlers write the same shape, so the
 * roll-up of the three request quotas lives here rather than in each.
 */
export function planLimitsToOrganizationColumns(limits: PlanLimits) {
    return {
        max_businesses: limits.maxLocations,
        max_team_members: limits.teamMembers,
        max_review_requests_per_month:
            limits.emailRequestsPerMonth +
            limits.smsRequestsPerMonth +
            limits.linkRequestsPerMonth,
        max_ai_replies_per_month: limits.smartRepliesPerMonth,
        max_email_requests_per_month: limits.emailRequestsPerMonth,
        max_sms_requests_per_month: limits.smsRequestsPerMonth,
        max_link_requests_per_month: limits.linkRequestsPerMonth,
    };
}
