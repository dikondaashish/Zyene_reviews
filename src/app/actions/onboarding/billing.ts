"use server";
import { createHash } from "node:crypto";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { stepPlanSchema, type StepPlanFormData } from "@/lib/validations/onboarding";
import { stripe } from "@/services/stripe/client";

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

    const { data: membership, error: membershipError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (membershipError || !membership || !["owner", "ORG_OWNER"].includes(membership.role)) {
      return { success: false, error: "You cannot manage this organization." };
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
 * `trialEventId` is set only when that subscription is in a Stripe trial: an opaque,
 * stable hash of the subscription id used as the Meta `StartTrial` event id.
 */
export async function finalizeOnboardingStripeCheckout(params: {
  sessionId?: string;
  planSwitchedOnly?: boolean;
}): Promise<{ success: boolean; error?: string; trialEventId?: string }> {
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
    let trialEventId: string | undefined;

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
      const session = await stripe.checkout.sessions.retrieve(params.sessionId, {
        expand: ["subscription"],
      });

      if (session.status !== "complete") {
        return { success: false, error: "Checkout is not complete." };
      }

      if (session.metadata?.organization_id !== orgId) {
        return { success: false, error: "This checkout does not belong to your organization." };
      }

      const subscription = session.subscription;
      if (!subscription) {
        return { success: false, error: "No subscription on this checkout session." };
      }

      // Checkout without intro-trial eligibility creates a paid subscription: no trial event.
      if (typeof subscription !== "string" && subscription.status === "trialing") {
        trialEventId = `trial_${createHash("sha256").update(subscription.id).digest("hex").slice(0, 32)}`;
      }
    } else {
      return { success: false, error: "Invalid request." };
    }

    const { error: updateError } = await supabase
      .from("users")
      // Automate (7) comes next: a paid plan can reply for the owner.
      .update({ onboarding_step: 7 } as never)
      .eq("id", user.id);

    if (updateError) {
      logger.error({ err: updateError }, "finalizeOnboardingStripeCheckout:");
      return { success: false, error: "Failed to update onboarding progress." };
    }

    revalidatePath("/onboarding");

    return { success: true, trialEventId };
  } catch (error: unknown) {
    logger.error({ err: error }, "finalizeOnboardingStripeCheckout:");
    return { success: false, error: "Could not verify checkout. Please try again." };
  }
}
