"use server";

import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Get the tour completion status for the current authenticated user.
 */
export async function getTourStatus(): Promise<boolean> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return true; // If not authenticated, don't show tour

    const { data } = await supabase
        .from("users")
        .select("has_completed_tour")
        .eq("id", user.id)
        .single();

    return data?.has_completed_tour ?? true;
}

/**
 * Mark the tour as completed for the current authenticated user.
 */
export async function completeTour(): Promise<{ success: boolean }> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false };

    const { error } = await supabase
        .from("users")
        .update({ has_completed_tour: true, updated_at: new Date().toISOString() })
        .eq("id", user.id);

    revalidatePath("/", "layout");
    return { success: !error };
}

/**
 * Reset the tour so it shows again (used by "Start Tour Again" in Settings).
 */
export async function resetTour(): Promise<{ success: boolean }> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false };

    const { error } = await supabase
        .from("users")
        .update({ has_completed_tour: false, updated_at: new Date().toISOString() })
        .eq("id", user.id);

    return { success: !error };
}
