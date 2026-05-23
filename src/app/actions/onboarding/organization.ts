"use server";
import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/db/redis";
import { stepOrganizationSchema, type StepOrganizationFormData } from "@/lib/validations/onboarding";
import { isOrganizationOwnerRole } from "@/lib/organization/organization-permissions";

export async function createOrganization(
  data: StepOrganizationFormData
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
    const validationResult = stepOrganizationSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = Object.values(validationResult.error.flatten().fieldErrors)[0]?.[0];
      return {
        success: false,
        error: firstError || "Validation failed",
      };
    }

    // Generate slug from organization name
    const slug = data.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: data.organizationName,
        slug: slug,
        type: "business",
        plan: "none",
        plan_status: "active",
      })
      .select()
      .single();

    if (orgError || !organization) {
      console.error("Error creating organization:", orgError);
      return {
        success: false,
        error: "Failed to create organization. Please try again.",
      };
    }

    // Invalidate business context cache
    const cacheKey = `user_businesses:${user.id}`;
    await redis.del(cacheKey).catch(e => console.error("Redis del error:", e));
    revalidatePath("/", "layout");

    // Add user as owner of organization
    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        role: "ORG_OWNER",
      });

    if (memberError) {
      console.error("Error adding organization member:", memberError);
      return {
        success: false,
        error: "Failed to set up organization access. Please try again.",
      };
    }

    revalidatePath("/onboarding");

    return {
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
    };
  } catch (error: unknown) {
    console.error("Unexpected error in createOrganization:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Update organization name (Step 1 of onboarding)
 */
export async function updateOrganizationName(
  organizationId: string,
  name: string
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "You are not authenticated." };
    }

    const { data: orgMembership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (!isOrganizationOwnerRole(orgMembership?.role)) {
      return {
        success: false,
        error: "Only the organization owner can change the organization name.",
      };
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let finalSlug = slug;
    let { error } = await supabase
      .from("organizations")
      .update({ name, slug: finalSlug, updated_at: new Date().toISOString() })
      .eq("id", organizationId);

    // Handle slug collision (23505 = unique_violation)
    if (error && error.code === "23505" && (error.message.includes("slug") || error.details?.includes("slug"))) {
      finalSlug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
      const { error: retryError } = await supabase
        .from("organizations")
        .update({ name, slug: finalSlug, updated_at: new Date().toISOString() })
        .eq("id", organizationId);
      
      error = retryError;
    }

    if (error) {
      console.error("Error updating organization:", error.message, error.details, error.hint);
      return { success: false, error: `Failed to update organization name: ${error.message}` };
    }
    const { error: stepError } = await supabase
      .from("users")
      .update({ onboarding_step: 2 } as never)
      .eq("id", user.id);
    if (stepError) console.error("Error updating onboarding step:", stepError);
    revalidatePath("/onboarding");
    return { success: true };
  } catch (error: unknown) {
    console.error("updateOrganizationName:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
