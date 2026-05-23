import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { stripe } from "@/services/stripe/client";
import * as Sentry from "@sentry/nextjs";
import { isOrganizationOwnerRole } from "@/lib/organization/organization-permissions";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";

interface OrgMemberWithRole {
  role: string;
  organizations: {
    id: string;
    stripe_customer_id: string | null;
  } | null;
}

export async function handleBillingPortal() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  }

  try {
    const admin = createAdminClient();
    const { data: member } = await admin
      .from("organization_members")
      .select("organization_id, role, organizations(*)")
      .eq("user_id", user.id)
      .single();

    if (!member) {
      return apiError("No organization found", { status: 404, code: "NOT_FOUND" });
    }

    const memberTyped = member as unknown as OrgMemberWithRole;
    const memberRole = memberTyped.role || "";
    if (!isOrganizationOwnerRole(memberRole)) {
      return apiError(
        "You don't have permission to manage billing. Contact your organization owner.",
        { status: 403, code: "FORBIDDEN" }
      );
    }

    const org = memberTyped.organizations;
    if (!org) {
      return apiError("Organization lookup failed", { status: 404, code: "NOT_FOUND" });
    }

    if (!org.stripe_customer_id) {
      return apiError("No billing account found. Please subscribe to a plan first.", {
        status: 400,
        code: "NO_BILLING_ACCOUNT",
      });
    }

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const dashboardUrl = rootDomain.includes("localhost")
      ? `http://${rootDomain}`
      : `https://app.${rootDomain}`;

    try {
      await stripe.customers.retrieve(org.stripe_customer_id);
    } catch (custError: unknown) {
      const stripeErrorCode =
        typeof custError === "object" && custError !== null && "code" in custError
          ? (custError as { code?: string }).code
          : undefined;

      if (stripeErrorCode === "resource_missing") {
        logger.error(
          { stripeCustomerId: org.stripe_customer_id, organizationId: member.organization_id },
          "Stale Stripe customer ID, clearing",
        );
        await admin
          .from("organizations")
          .update({ stripe_customer_id: null, stripe_subscription_id: null })
          .eq("id", member.organization_id);

        return apiError("Your billing account needs to be set up. Please subscribe to a plan first.", {
          status: 400,
          code: "STALE_CUSTOMER",
        });
      }
      throw custError;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${dashboardUrl}/settings/billing`,
    });

    return apiOk({ url: session.url });
  } catch (error: unknown) {
    logger.error({ err: error }, "Portal Error");
    Sentry.captureException(error, { tags: { route: "billing-portal" } });
    const apiErr = toApiError(error);
    if (error instanceof ApiRouteError) {
      return apiError(apiErr.message, { status: apiErr.status, code: apiErr.code });
    }
    return apiError("Failed to open billing portal. Please try again.", {
      status: 500,
      code: "PORTAL_ERROR",
    });
  }
}
