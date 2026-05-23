"use server";
import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/db/redis";
import {
  stepBusinessLocationSchema,
  stepCategorySchema,
  type StepBusinessLocationFormData,
  type StepCategoryFormData,
} from "@/lib/validations/onboarding";

export async function updateBusinessAndLocation(
  businessId: string,
  data: { businessName: string; address?: string; city?: string; state?: string; phone?: string }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "You are not authenticated." };
    }
    const slug = data.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const { error } = await supabase
      .from("businesses")
      .update({
        name: data.businessName,
        slug,
        address_line1: data.address || null,
        city: data.city || null,
        state: data.state || null,
        phone: data.phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", businessId);
    if (error) {
      console.error("Error updating business:", error);
      return { success: false, error: "Failed to update business." };
    }
    revalidatePath("/onboarding");
    return { success: true };
  } catch (error: unknown) {
    console.error("updateBusinessAndLocation:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

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
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .insert({
        organization_id: organizationId,
        name: data.businessName,
        slug: businessSlug,
        address_line1: data.address,
        city: data.city,
        state: data.state.toUpperCase(),
        phone: data.phone || null,
        category: "uncategorized", // Will be set in Step 3
        country: "US", // Default to US
        timezone: "America/Los_Angeles", // Default timezone, can be updated later
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
      console.error("Error creating business membership:", memberError);
      return {
        success: false,
        error: "Business created, but failed to assign access. Please contact support.",
      };
    }

    // Invalidate business context cache
    const cacheKey = `user_businesses:${user.id}`;
    await redis.del(cacheKey).catch(e => console.error("Redis del error:", e));
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
    console.error("Unexpected error in createBusinessWithLocation:", error);
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
        category: data.category,
      })
      .eq("id", businessId);

    if (updateError) {
      console.error("Error updating business category:", updateError);
      return {
        success: false,
        error: "Failed to update category. Please try again.",
      };
    }

    // Update onboarding step to 4 (Plan Selection)
    const { error: stepError } = await supabase
      .from("users")
      .update({
        onboarding_step: 4,
      } as never)
      .eq("id", user.id);

    if (stepError) {
      console.error("Error updating onboarding step:", stepError);
    }

    // Invalidate business context cache
    const cacheKey = `user_businesses:${user.id}`;
    await redis.del(cacheKey).catch(e => console.error("Redis del error:", e));
    revalidatePath("/", "layout");
    revalidatePath("/businesses");
    revalidatePath("/onboarding");

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("Unexpected error in updateBusinessCategory:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
