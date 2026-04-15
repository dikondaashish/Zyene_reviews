/**
 * Previews the next invoice after a subscription plan change using Stripe’s
 * `invoices.createPreview` API (successor to the deprecated upcoming-invoice flow).
 */
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { stripe } from "@/services/stripe/client";
import { getPlanByPriceId, isPaidPlanTierDowngrade, isPaidPlanTierUpgrade, PLANS } from "@/services/stripe/plans";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { isOrganizationOwnerRole } from "@/lib/organization/organization-permissions";

const bodySchema = z.object({
    priceId: z.string().min(1).max(120),
});

export type ProrationPreviewPayload =
    | {
          previewAvailable: true;
          amountDueTodayCents: number;
          amountDueTodayFormatted: string;
          currency: string;
      }
    | { previewAvailable: false };

function formatMoney(cents: number, currency: string): string {
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(cents / 100);
    } catch {
        const sym = currency.toLowerCase() === "usd" ? "$" : `${currency.toUpperCase()} `;
        return `${sym}${(cents / 100).toFixed(2)}`;
    }
}

export async function POST(request: Request) {
    const { logger, requestId } = createRequestLogger("POST /api/billing/proration-preview");
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return apiError("Unauthorized", { status: 401, details: requestId });
    }

    let parsed: z.infer<typeof bodySchema>;
    try {
        const json = await request.json();
        const r = bodySchema.safeParse(json);
        if (!r.success) {
            return apiError(r.error.issues[0]?.message || "Invalid body", { status: 400, details: requestId });
        }
        parsed = r.data;
    } catch {
        return apiError("Invalid JSON body", { status: 400, details: requestId });
    }

    const { priceId } = parsed;

    const validPriceIds = PLANS.map((p) => p.stripePriceId).filter(Boolean) as string[];
    if (!validPriceIds.includes(priceId)) {
        return apiError("Invalid plan selected", { status: 400, details: requestId });
    }

    interface OrgMemberWithRole {
        role: string;
        organizations: {
            id: string;
            stripe_customer_id: string | null;
            stripe_subscription_id: string | null;
        } | null;
    }

    const admin = createAdminClient();
    const { data: member } = await admin
        .from("organization_members")
        .select("organization_id, role, organizations(*)")
        .eq("user_id", user.id)
        .single();

    if (!member) {
        return apiError("No organization found", { status: 404, details: requestId });
    }

    const memberTyped = member as unknown as OrgMemberWithRole;
    const memberRole = memberTyped.role;
    if (!isOrganizationOwnerRole(memberRole)) {
        return apiError("You don't have permission to manage billing. Contact your organization owner.", {
            status: 403,
            details: requestId,
        });
    }

    const org = memberTyped.organizations;
    if (!org?.stripe_subscription_id || !org.stripe_customer_id) {
        const fallback: ProrationPreviewPayload = { previewAvailable: false };
        return apiOk(fallback);
    }

    try {
        const subscription = await stripe.subscriptions.retrieve(org.stripe_subscription_id);
        const subscriptionCustomerId =
            typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
        if (subscriptionCustomerId !== org.stripe_customer_id) {
            logger.warn({ requestId }, "Subscription customer mismatch; skipping proration preview");
            const fallback: ProrationPreviewPayload = { previewAvailable: false };
            return apiOk(fallback);
        }

        if (!["active", "trialing", "past_due"].includes(subscription.status)) {
            const fallback: ProrationPreviewPayload = { previewAvailable: false };
            return apiOk(fallback);
        }

        const currentItem = subscription.items.data[0];
        if (!currentItem?.id) {
            const fallback: ProrationPreviewPayload = { previewAvailable: false };
            return apiOk(fallback);
        }

        const currentPriceId = currentItem.price?.id;
        if (currentPriceId === priceId) {
            const fallback: ProrationPreviewPayload = { previewAvailable: false };
            return apiOk(fallback);
        }

        const currentPlan = currentPriceId ? getPlanByPriceId(currentPriceId) : null;
        const targetPlan = getPlanByPriceId(priceId);
        const endTrialForTierUpgrade =
            subscription.status === "trialing" &&
            currentPlan &&
            targetPlan &&
            isPaidPlanTierUpgrade(currentPlan.id, targetPlan.id);

        const tierDowngrade =
            currentPlan &&
            targetPlan &&
            isPaidPlanTierDowngrade(currentPlan.id, targetPlan.id);

        const preview = await stripe.invoices.createPreview({
            customer: org.stripe_customer_id,
            subscription: org.stripe_subscription_id,
            subscription_details: {
                items: [{ id: currentItem.id, price: priceId }],
                proration_behavior: tierDowngrade ? "none" : "create_prorations",
                ...(endTrialForTierUpgrade ? { trial_end: "now" } : {}),
            },
        });

        const currency = preview.currency || "usd";
        const amountDueTodayCents = preview.amount_due ?? 0;
        const payload: ProrationPreviewPayload = {
            previewAvailable: true,
            amountDueTodayCents,
            amountDueTodayFormatted: formatMoney(amountDueTodayCents, currency),
            currency,
        };

        logger.info(
            { requestId, organizationId: member.organization_id, amountDueTodayCents, currency },
            "Proration preview created"
        );
        return apiOk(payload);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.warn("[proration-preview] Stripe createPreview failed:", message);
        Sentry.captureException(e, { tags: { route: "billing-proration-preview" } });
        const fallback: ProrationPreviewPayload = { previewAvailable: false };
        return apiOk(fallback);
    }
}
