
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function disconnectGoogle(platformId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // Verify ownership (optional but recommended, RLS should handle it if set up correctly)
    // We'll trust RLS for now or add a check if needed. 
    // delete match by ID and ensuring it belongs to a business the user owns is safer.

    // Simplest: Delete by ID. RLS must enforce user access.
    const { error } = await supabase
        .from("review_platforms")
        .delete()
        .eq("id", platformId);

    if (error) {
        console.error("Error disconnecting Google:", error);
        throw new Error("Failed to disconnect");
    }

    revalidatePath("/integrations");
}
