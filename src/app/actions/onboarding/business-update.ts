"use server";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";

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
    const businessUpdate = {
      name: data.businessName,
      address_line1: data.address || null,
      city: data.city || null,
      state: data.state || null,
      phone: data.phone || null,
      updated_at: new Date().toISOString(),
    };
    let { error } = await supabase
      .from("businesses")
      .update(slug ? { ...businessUpdate, slug } : businessUpdate)
      .eq("id", businessId);
    // Another business already owns this slug: keep the existing slug and
    // save the rest instead of blocking onboarding (same as Google finalize).
    if (error?.code === "23505" && slug) {
      ({ error } = await supabase.from("businesses").update(businessUpdate).eq("id", businessId));
    }
    if (error) {
      logger.error({ err: error }, "Error updating business:");
      return { success: false, error: "Failed to update business." };
    }
    revalidatePath("/onboarding");
    return { success: true };
  } catch (error: unknown) {
    logger.error({ err: error }, "updateBusinessAndLocation:");
    return { success: false, error: "An unexpected error occurred." };
  }
}
