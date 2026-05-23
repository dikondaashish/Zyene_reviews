import type { SupabaseClient } from "@supabase/supabase-js";

export async function removeBrandingLogoFromStorage(supabase: SupabaseClient, url: string): Promise<void> {
    if (!url || !url.includes("supabase.co")) return;
    try {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split("/");
        const fileName = parts[parts.length - 1];
        await supabase.storage.from("business-logos").remove([fileName]);
    } catch {
    }
}
