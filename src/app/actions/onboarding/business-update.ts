"use server";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { STEP3_CATEGORIES } from "@/components/onboarding/step3-form-categories";

const INDUSTRY_TILES = new Set<string>(STEP3_CATEGORIES.map((c) => c.value));

export async function updateBusinessAndLocation(
  businessId: string,
  data: { businessName: string; address?: string; city?: string; state?: string; country?: string; phone?: string; website?: string; category?: string }
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
      // Only a real two-letter code; anything else leaves the stored country alone.
      ...(data.country && /^[A-Z]{2}$/.test(data.country) ? { country: data.country } : {}),
      // Only a real industry tile detected from Google; never "other" or "uncategorized" from here.
      ...(data.category && INDUSTRY_TILES.has(data.category) && data.category !== "other" ? { category: data.category } : {}),
      // Only a real web address from the Google pick; a blank one never clears a saved site.
      ...(data.website && /^https?:\/\/\S+$/i.test(data.website) && data.website.length <= 300 ? { website: data.website } : {}),
      phone: data.phone || null,
      updated_at: new Date().toISOString(),
    };
    let { data: saved, error } = await supabase
      .from("businesses")
      .update(slug ? { ...businessUpdate, slug } : businessUpdate)
      .eq("id", businessId)
      .select("slug");
    // Another business already owns this slug: keep the existing slug and
    // save the rest instead of blocking onboarding (same as Google finalize).
    if (error?.code === "23505" && slug) {
      ({ data: saved, error } = await supabase.from("businesses").update(businessUpdate).eq("id", businessId).select("slug"));
    }
    if (error) {
      logger.error({ err: error }, "Error updating business:");
      return { success: false, error: "Failed to update business." };
    }
    revalidatePath("/onboarding");
    // The review link comes from the name, so the next step can show (and let them change) it.
    return { success: true, slug: (saved?.[0]?.slug as string | undefined) ?? null };
  } catch (error: unknown) {
    logger.error({ err: error }, "updateBusinessAndLocation:");
    return { success: false, error: "An unexpected error occurred." };
  }
}
