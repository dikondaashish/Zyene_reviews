
"use server";

import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function disconnectGoogle(platformId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // 1. Hide the reviews (orphan them) rather than deleting
    // This allows for delta-syncs on reconnect and data preservation
    await supabase
        .from("reviews")
        .update({ is_visible: false })
        .eq("platform_id", platformId);

    // 2. Delete the platform row.
    const { error, count } = await supabase
        .from("review_platforms")
        .delete({ count: "exact" })
        .eq("id", platformId);

    if (error) {
        console.error("Error disconnecting Google:", error);
        throw new Error("Failed to disconnect");
    }

    if (count === 0) {
        console.error("No rows deleted — RLS may have blocked the operation");
        throw new Error("Failed to disconnect: permission denied");
    }

    // Revalidate the integrations page cache
    revalidatePath("/(dashboard)/integrations", "page");
    revalidatePath("/(dashboard)/reviews", "page");
}
