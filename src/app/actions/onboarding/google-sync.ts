"use server";
import { createClient } from "@/lib/db/supabase/server";
import { enqueueGooglePostConnectSync } from "./types";

export async function triggerOnboardingSync(businessId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    // Find if Google is connected for this business
    const { data: platform } = await supabase
      .from("review_platforms")
      .select("*")
      .eq("business_id", businessId)
      .eq("platform", "google")
      .maybeSingle();

    if (!platform) return { success: false, error: "Google not connected" };

    const outcome = await enqueueGooglePostConnectSync(platform.id);
    if (outcome.mode === "failed") {
      return { success: false, error: outcome.error || "Failed to trigger sync" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error triggering onboarding sync:", error);
    return { success: false, error: "Failed to trigger sync" };
  }
}
