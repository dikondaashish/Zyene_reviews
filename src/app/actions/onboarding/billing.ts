"use server";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { stepPlanSchema, type StepPlanFormData } from "@/lib/validations/onboarding";
import { stripe } from "@/services/stripe/client";
import { PLAN_MAP, UNSUBSCRIBED_LIMITS } from "@/services/stripe/plans";

export async function savePlanSelection(
  organizationId: string,
  data: StepPlanFormData
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You are not authenticated.",
      };
    }

    // Validate input
    const validationResult = stepPlanSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = Object.values(validationResult.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Validation failed",
      };
    }

    // Get limits for the selected plan
    const planConfig = PLAN_MAP[data.plan];
    const limits = planConfig?.limits || UNSUBSCRIBED_LIMITS;

    // Update organization plan and limits
    const { error: orgError } = await supabase
      .from("organizations")
      .update({
        plan: data.plan,
        plan_status: data.plan === "none" ? "active" : "trialing", // Trialing for paid plans
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", organizationId);

    if (orgError) {
      logger.error({ err: orgError }, "Error saving plan selection:");
      return {
        success: false,
        error: "Failed to save plan. Please try again.",
      };
    }

    // Update onboarding step to 5 (Completion)
    const { error: updateError } = await supabase
      .from("users")
      .update({
        onboarding_step: 5,
      } as never)
      .eq("id", user.id);

    if (updateError) {
      logger.error({ err: updateError }, "Error updating onboarding step:");
      return {
        success: false,
        error: "Failed to save progress. Please try again.",
      };
    }

    revalidatePath("/onboarding");

    return {
      success: true,
    };
  } catch (error: unknown) {
    logger.error({ err: error }, "Unexpected error in savePlanSelection:");
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * After Stripe Checkout redirects back to onboarding, verify the session belongs to
 * the user's org (subscription is created; plan limits are synced via webhook).
 */
export async function finalizeOnboardingStripeCheckout(params: {
  sessionId?: string;
  planSwitchedOnly?: boolean;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You are not authenticated." };
    }

    const { data: member } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!member?.organization_id) {
      return { success: false, error: "No organization found." };
    }

    const orgId = member.organization_id as string;

    if (params.planSwitchedOnly) {
      const { data: org } = await supabase
        .from("organizations")
        .select("stripe_subscription_id")
        .eq("id", orgId)
        .single();

      if (!org?.stripe_subscription_id) {
        return { success: false, error: "Subscription not found yet. Please refresh." };
      }
    } else if (params.sessionId) {
      const session = await stripe.checkout.sessions.retrieve(params.sessionId);

      if (session.status !== "complete") {
        return { success: false, error: "Checkout is not complete." };
      }

      if (session.metadata?.organization_id !== orgId) {
        return { success: false, error: "This checkout does not belong to your organization." };
      }

      const subscriptionId = session.subscription as string | null;
      if (!subscriptionId) {
        return { success: false, error: "No subscription on this checkout session." };
      }
    } else {
      return { success: false, error: "Invalid request." };
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ onboarding_step: 5 } as never)
      .eq("id", user.id);

    if (updateError) {
      logger.error({ err: updateError }, "finalizeOnboardingStripeCheckout:");
      return { success: false, error: "Failed to update onboarding progress." };
    }

    revalidatePath("/onboarding");

    return { success: true };
  } catch (error: unknown) {
    logger.error({ err: error }, "finalizeOnboardingStripeCheckout:");
    return { success: false, error: "Could not verify checkout. Please try again." };
  }
}
