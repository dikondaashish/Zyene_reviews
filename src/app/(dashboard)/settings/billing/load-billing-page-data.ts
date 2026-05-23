import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { checkLimit } from "@/lib/stripe/check-limits";
import { PLANS } from "@/services/stripe/plans";
import { isEligibleForIntroTrial } from "@/lib/stripe/checkout-trial-eligibility";
import { reconcileOrganizationBillingFromStripe } from "@/services/stripe/organization-billing-sync";
import { isOrganizationOwnerRole } from "@/lib/organization/organization-permissions";

type BillingOrgRow = {
    id: string;
    name: string;
    plan: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    plan_status: string | null;
};

type BillingMemberRow = {
    role: string;
    organizations: BillingOrgRow | null;
};

export type BillingPageData =
    | { kind: "member-error" }
    | { kind: "no-org" }
    | { kind: "org-refresh-error" }
    | {
          kind: "ok";
          clientProps: {
              currentPlan: (typeof PLANS)[number] | null;
              organizationPlanId: string;
              planStatus: string;
              hasStripeCustomer: boolean;
              hasActiveStripeSubscription: boolean;
              checkoutOffersTrial: boolean;
              canManageBilling: boolean;
              usage: {
                  emailRequests: { used: number; max: number };
                  smsRequests: { used: number; max: number };
                  linkRequests: { used: number; max: number };
                  smartReplies: { used: number; max: number };
                  businesses: { used: number; max: number };
              };
              plans: typeof PLANS;
          };
      };

export async function loadBillingPageData(userId: string): Promise<BillingPageData> {
    const supabase = await createClient();

    const { data: memberData, error: memberDataError } = await supabase
        .from("organization_members")
        .select(`
            role,
            organizations (
                id,
                name,
                plan,
                stripe_customer_id,
                stripe_subscription_id,
                plan_status
            )
        `)
        .eq("user_id", userId)
        .single();

    if (memberDataError) {
        logger.error({ err: memberDataError }, "[Billing settings] Member fetch failed:");
        return { kind: "member-error" };
    }

    const memberTyped = memberData as BillingMemberRow | null;
    const canManageBilling = isOrganizationOwnerRole(memberTyped?.role ?? "");
    const org = memberTyped?.organizations ?? null;

    if (!org) {
        return { kind: "no-org" };
    }

    const admin = createAdminClient();
    await reconcileOrganizationBillingFromStripe(admin, {
        id: org.id,
        stripe_subscription_id: org.stripe_subscription_id,
        stripe_customer_id: org.stripe_customer_id,
    });

    const { data: orgRefreshed, error: orgRefreshError } = await admin
        .from("organizations")
        .select("id, name, plan, stripe_customer_id, stripe_subscription_id, plan_status")
        .eq("id", org.id)
        .single();

    if (orgRefreshError) {
        logger.error({ err: orgRefreshError }, "[Billing settings] Organization refresh failed:");
        return { kind: "org-refresh-error" };
    }

    const orgLive = orgRefreshed ?? org;

    const [emailRequests, smsRequests, linkRequests, smartReplies, businesses] = await Promise.all([
        checkLimit(orgLive.id, "email_requests"),
        checkLimit(orgLive.id, "sms_requests"),
        checkLimit(orgLive.id, "link_requests"),
        checkLimit(orgLive.id, "smart_replies"),
        checkLimit(orgLive.id, "businesses"),
    ]);

    const orgPlanId = orgLive.plan || "none";
    const currentPlan = PLANS.find((p) => p.id === orgPlanId) || null;
    const checkoutOffersTrial = await isEligibleForIntroTrial(orgLive.stripe_customer_id ?? null);
    const planStatusNorm = String(orgLive.plan_status || "");
    const hasActiveStripeSubscription =
        Boolean(orgLive.stripe_subscription_id) &&
        ["active", "trialing", "past_due"].includes(planStatusNorm);

    return {
        kind: "ok",
        clientProps: {
            currentPlan,
            organizationPlanId: orgPlanId,
            planStatus: orgLive.plan_status || "active",
            hasStripeCustomer: !!orgLive.stripe_customer_id,
            hasActiveStripeSubscription,
            checkoutOffersTrial,
            canManageBilling,
            usage: {
                emailRequests: { used: emailRequests.current, max: emailRequests.max },
                smsRequests: { used: smsRequests.current, max: smsRequests.max },
                linkRequests: { used: linkRequests.current, max: linkRequests.max },
                smartReplies: { used: smartReplies.current, max: smartReplies.max },
                businesses: { used: businesses.current, max: businesses.max },
            },
            plans: PLANS,
        },
    };
}
