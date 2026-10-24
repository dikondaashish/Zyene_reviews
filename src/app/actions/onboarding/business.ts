"use server";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/db/redis";
import { nameDefaultWorkspaceAfterBusiness } from "@/services/onboarding/name-default-workspace";
import {
  stepBusinessLocationSchema,
  stepCategorySchema,
  type StepBusinessLocationFormData,
  type StepCategoryFormData,
} from "@/lib/validations/onboarding";

/**
 * Step 2: Create Business + Location Details
 * User enters business name + location details → Creates business record with location info
 */
export async function createBusinessWithLocation(
  organizationId: string,
  data: StepBusinessLocationFormData
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
    const validationResult = stepBusinessLocationSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = Object.values(validationResult.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Validation failed",
      };
    }

    // Generate business slug
    const businessSlug = data.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create business with location info
    const insertBusiness = (slug: string) =>
      supabase
        .from("businesses")
        .insert({
          organization_id: organizationId,
          name: data.businessName,
          slug,
          address_line1: data.address,
          city: data.city,
          state: (data.country ?? "US") === "US" ? data.state.toUpperCase() : data.state || null,
          phone: data.phone || null,
          category: "uncategorized", // Will be set in Step 3
          country: data.country ?? "US",
          timezone: "America/Los_Angeles", // Default timezone, can be updated later
        })
        .select()
        .single();
    let { data: business, error: businessError } = await insertBusiness(businessSlug);
    // Slug taken by another business ("Joe's Pizza" twice): retry with a short suffix.
    if (businessError?.code === "23505" && businessError.message.includes("slug")) {
      const suffix = Math.random().toString(36).substring(2, 6);
      ({ data: business, error: businessError } = await insertBusiness(
        businessSlug ? `${businessSlug}-${suffix}` : suffix,
      ));
    }

    if (businessError || !business) {
      logger.error({ err: businessError }, "Error creating business:");
      return {
        success: false,
        error: "Failed to create business. Please try again.",
      };
    }

    // Ensure the creator can access the newly-created business in business-scoped flows.
    const { error: memberError } = await supabase.from("business_members").upsert(
      {
        business_id: business.id,
        user_id: user.id,
        role: "owner",
        status: "active",
      },
      { onConflict: "business_id,user_id" }
    );

    if (memberError) {
      logger.error({ err: memberError }, "Error creating business membership:");
      return {
        success: false,
        error: "Business created, but failed to assign access. Please contact support.",
      };
    }

    // Invalidate business context cache
    const cacheKey = `user_businesses:${user.id}`;
    await redis.del(cacheKey).catch(e => logger.error({ err: e }, "Redis del error:"));
    revalidatePath("/", "layout");
    revalidatePath("/onboarding");

    return {
      success: true,
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        address_line1: business.address_line1,
        city: business.city,
        state: business.state,
      },
    };
  } catch (error: unknown) {
    logger.error({ err: error }, "Unexpected error in createBusinessWithLocation:");
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Step 3: Update Business Category
 * User selects business category → Updates business record
 */
export async function updateBusinessCategory(
  businessId: string,
  data: StepCategoryFormData
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
    const validationResult = stepCategorySchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = Object.values(validationResult.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Validation failed",
      };
    }

    // Update business category
    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        category: validationResult.data.category,
        ...(validationResult.data.supportEmail ? { email: validationResult.data.supportEmail } : {}),
      })
      .eq("id", businessId);

    if (updateError) {
      logger.error({ err: updateError }, "Error updating business category:");
      return {
        success: false,
        error: "Failed to update category. Please try again.",
      };
    }

    await nameDefaultWorkspaceAfterBusiness(supabase, businessId);

    // Owners with Google go to their results (6) before the plan (4).
    const { data: googleRow } = await supabase
      .from("review_platforms")
      .select("google_location_id")
      .eq("business_id", businessId)
      .eq("platform", "google")
      .maybeSingle();
    const { error: stepError } = await supabase
      .from("users")
      .update({
        onboarding_step: googleRow?.google_location_id ? 6 : 4,
      } as never)
      .eq("id", user.id);

    if (stepError) {
      logger.error({ err: stepError }, "Error updating onboarding step:");
    }

    // Invalidate business context cache
    const cacheKey = `user_businesses:${user.id}`;
    await redis.del(cacheKey).catch(e => logger.error({ err: e }, "Redis del error:"));
    revalidatePath("/", "layout");
    revalidatePath("/businesses");
    revalidatePath("/onboarding");

    return {
      success: true,
    };
  } catch (error: unknown) {
    logger.error({ err: error }, "Unexpected error in updateBusinessCategory:");
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
