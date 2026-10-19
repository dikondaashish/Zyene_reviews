import { apiError, apiOk } from "@/app/api/_shared/responses";
import { loadActiveBillingMember } from "@/lib/billing/active-billing-member";
import { createClient } from "@/lib/db/supabase/server";
import { isOrganizationOwnerRole } from "@/lib/organization/organization-permissions";
import { metaConsentMetadataFromRequest } from "@/lib/privacy/meta-attribution-consent";
import { logger } from "@/lib/logger";
import { stripe } from "@/services/stripe/client";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return apiOk({ updated: false });

        const active = await loadActiveBillingMember(user.id);
        if (active.kind !== "ok" || !active.member || !isOrganizationOwnerRole(active.member.role)) {
            return apiOk({ updated: false });
        }

        const organization = active.member.organizations;
        const subscriptionId = organization?.stripe_subscription_id;
        if (!subscriptionId || !organization?.stripe_customer_id) return apiOk({ updated: false });

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
        if (customerId !== organization.stripe_customer_id) return apiError("Billing binding mismatch", { status: 409 });
        if (!["active", "trialing", "past_due"].includes(subscription.status)) return apiOk({ updated: false });

        const metadata = metaConsentMetadataFromRequest(request);
        if (metadata.meta_marketing_consent === "1") {
            const { meta_fbp, meta_fbc, ...consentMetadata } = metadata;
            await stripe.subscriptions.update(subscriptionId, {
                metadata: {
                    ...consentMetadata,
                    ...(meta_fbp ? { meta_fbp } : {}),
                    ...(meta_fbc ? { meta_fbc } : {}),
                },
            });
        } else {
            await stripe.subscriptions.update(subscriptionId, { metadata });
        }
        return apiOk({ updated: true });
    } catch (error) {
        logger.warn({ err: error }, "Could not sync Meta marketing consent to Stripe");
        return apiError("Could not sync marketing preferences", { status: 503 });
    }
}
