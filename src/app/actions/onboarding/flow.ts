"use server";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import {
  step3FormSchema,
  step4FormSchema,
  type Step3FormData,
  type Step4FormData,
} from "@/lib/validations/onboarding";
import { enqueueGooglePostConnectSync } from "./types";

export async function updateOnboardingStep(
  businessId: string,
  step: number
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

    // Update onboarding step
    const { error } = await supabase
      .from("users")
      .update({
        onboarding_step: step,
        onboarding_completed: step === 5,
      } as never)
      .eq("id", user.id);

    if (error) {
      logger.error({ err: error }, "Error updating onboarding step:");
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
    logger.error({ err: error }, "Unexpected error in updateOnboardingStep:");
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function saveNotificationPreferences(
  businessId: string,
  data: Step3FormData
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
    const validationResult = await step3FormSchema.safeParseAsync(data);
    if (!validationResult.success) {
      const firstError = Object.values(validationResult.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Validation failed",
      };
    }

    // Ensure SMS phone number is provided if SMS is enabled
    if (data.smsAlerts && !data.smsPhoneNumber) {
      return {
        success: false,
        error: "Please provide a phone number for SMS alerts.",
      };
    }

    // Upsert notification preferences
    const { error: preferencesError } = await supabase
      .from("notification_preferences")
      .upsert(
        {
          user_id: user.id,
          business_id: businessId,
          email_enabled: data.emailAlerts,
          email_frequency: data.emailFrequency,
          sms_enabled: data.smsAlerts,
          sms_phone_number: data.smsPhoneNumber || null,
          min_rating_threshold: parseInt(data.minRatingThreshold),
        },
        { onConflict: "user_id,business_id" }
      );

    if (preferencesError) {
      logger.error({ err: preferencesError }, "Error saving notification preferences:");
      return {
        success: false,
        error: "Failed to save notification preferences. Please try again.",
      };
    }

    // Update onboarding step to 4
    const { error: updateError } = await supabase
      .from("users")
      .update({
        onboarding_step: 5,
        onboarding_completed: true,
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
    logger.error({ err: error }, "Unexpected error in saveNotificationPreferences:");
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function sendFirstReviewRequest(
  businessId: string,
  data: Step4FormData
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
    const validationResult = await step4FormSchema.safeParseAsync(data);
    if (!validationResult.success) {
      const firstError = Object.values(validationResult.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Validation failed",
      };
    }

    // Ensure phone is provided if SMS channel is selected
    if ((data.channel === "sms" || data.channel === "both") && !data.recipientPhone) {
      return {
        success: false,
        error: "Please provide a phone number for SMS delivery.",
      };
    }

    // Create review request
    const { data: reviewRequest, error: requestError } = await supabase
      .from("review_requests")
      .insert({
        business_id: businessId,
        recipient_name: data.recipientName,
        recipient_email: data.recipientEmail,
        recipient_phone: data.recipientPhone || null,
        channel: data.channel,
        status: "pending",
        created_at: new Date().toISOString(),
        is_onboarding: true, // Mark as onboarding request for analytics
      })
      .select()
      .single();

    if (requestError || !reviewRequest) {
      logger.error({ err: requestError }, "Error creating review request:");
      return {
        success: false,
        error: "Failed to send review request. Please try again.",
      };
    }

    // Mark onboarding as completed
    const { error: completionError } = await supabase
      .from("users")
      .update({
        onboarding_step: 4,
        onboarding_completed: true,
      } as never)
      .eq("id", user.id);

    if (completionError) {
      logger.error({ err: completionError }, "Error marking onboarding complete:");
      // Continue anyway - request was successful
    }

    revalidatePath("/onboarding");
    revalidatePath("/dashboard");

    return {
      success: true,
      reviewRequestId: reviewRequest.id,
    };
  } catch (error: unknown) {
    logger.error({ err: error }, "Unexpected error in sendFirstReviewRequest:");
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function completeOnboarding(businessId: string) {
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

    // Mark onboarding as completed
    const { error } = await supabase
      .from("users")
      .update({
        onboarding_step: 5,
        onboarding_completed: true,
      } as never)
      .eq("id", user.id);

    if (error) {
      logger.error({ err: error }, "Error completing onboarding:");
      return {
        success: false,
        error: "Failed to complete onboarding. Please try again.",
      };
    }

    // Safety net: if Google is connected but we never recorded a successful sync (or row is in error), queue again.
    const { data: googlePlatform } = await supabase
      .from("review_platforms")
      .select("id, last_synced_at, sync_status")
      .eq("business_id", businessId)
      .eq("platform", "google")
      .maybeSingle();

    if (googlePlatform?.id) {
      const status = String(googlePlatform.sync_status ?? "").toLowerCase();
      const stuckError =
        status === "error" ||
        status.startsWith("error_");
      const neverSynced = googlePlatform.last_synced_at == null;
      const notRunning = status !== "running";

      if (notRunning && (neverSynced || stuckError)) {
        const catchUp = await enqueueGooglePostConnectSync(googlePlatform.id);
        if (catchUp.mode === "failed") {
          logger.error({ err: catchUp.error
           }, "[completeOnboarding] Catch-up Google sync failed:");
        }
      }
    }

    revalidatePath("/onboarding");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error: unknown) {
    logger.error({ err: error }, "Unexpected error in completeOnboarding:");
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
