/**
 * Billing deep link when the user is at max businesses (or OAuth add-business hits the cap).
 * The hash matches `id="billing-plan-professional"` on the billing page so we can scroll
 * directly to the Professional / multi-location upgrade card.
 */
export const BUSINESS_LIMIT_UPGRADE_BILLING_HREF =
    "/settings/billing?status=limit_reached#billing-plan-professional";

/** DOM id on the Professional plan card (month or year interval). */
export const BILLING_PLAN_PROFESSIONAL_ANCHOR_ID = "billing-plan-professional";
