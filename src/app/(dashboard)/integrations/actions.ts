
"use server";

import { createClient } from "@/lib/supabase/server";
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

    // Delete the platform row. RLS policy enforces ownership via business → org membership.
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

    // Redirect to onboarding since GBP is no longer connected
    redirect("/onboarding");
}
