"use server";
import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { step1FormSchema, type Step1FormData } from "@/lib/validations/onboarding";

export async function createBusinessAndAdvanceOnboarding(
  data: Step1FormData,
  organizationId: string
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
    const validationResult = await step1FormSchema.safeParseAsync(data);
    if (!validationResult.success) {
      const firstError = Object.values(validationResult.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Validation failed",
      };
    }

    // Generate slug from business name
    const slug = data.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create business
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .insert({
        organization_id: organizationId,
        name: data.businessName,
        category: data.businessCategory,
        city: data.city,
        phone: data.phone || null,
        slug: slug,
      })
      .select()
      .single();

    if (businessError || !business) {
      console.error("Error creating business:", businessError);
      return {
        success: false,
        error: "Failed to create business. Please try again.",
      };
    }

    // Update onboarding step
    const { error: updateError } = await supabase
      .from("users")
      .update({ onboarding_step: 2 } as never)
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating onboarding step:", updateError);
      return {
        success: false,
        error: "Failed to save progress. Please try again.",
      };
    }

    revalidatePath("/onboarding");

    return {
      success: true,
      business,
    };
  } catch (error: unknown) {
    console.error("Unexpected error in createBusinessAndAdvanceOnboarding:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
