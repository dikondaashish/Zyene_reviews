"use server";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { stepNotificationsSchema, type StepNotificationsFormData } from "@/lib/validations/onboarding";

export async function createNotificationPreferences(
  businessId: string,
  data: StepNotificationsFormData
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
        error: "You are not authenticated. Please log in and try again.",
      };
    }

    // Validate input
    const validationResult = stepNotificationsSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = Object.values(validationResult.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Validation failed",
      };
    }

    const { data: profile } = await supabase.from("users").select("phone").eq("id", user.id).maybeSingle();
    const { data: existingPref } = await supabase
      .from("notification_preferences")
      .select("sms_phone_number")
      .eq("user_id", user.id)
      .eq("business_id", businessId)
      .maybeSingle();

    const fromForm = data.phone?.trim() || "";
    const smsPhone =
      fromForm ||
      existingPref?.sms_phone_number?.trim() ||
      profile?.phone?.trim() ||
      null;

    const { error: preferencesError } = await supabase.from("notification_preferences").upsert(
      {
        user_id: user.id,
        business_id: businessId,
        email_enabled: data.emailAlerts,
        sms_enabled: data.smsAlerts,
        sms_phone_number: smsPhone,
        email_frequency: "immediately",
        digest_enabled: true,
        quiet_hours_start: "22:00:00",
        quiet_hours_end: "08:00:00",
        min_urgency_for_sms: 1,
        min_rating_threshold: 1,
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

    // Mark onboarding as completed for the user
    const { error: updateError } = await supabase
      .from("users")
      .update({
        onboarding_completed: true,
      } as never)
      .eq("id", user.id);

    if (updateError) {
      logger.error({ err: updateError }, "Error marking onboarding complete:");
      // Continue anyway - preferences were saved
    }

    revalidatePath("/onboarding");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error: unknown) {
    logger.error({ err: error }, "Unexpected error in createNotificationPreferences:");
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
