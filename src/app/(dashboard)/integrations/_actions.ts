"use server";

import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
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

    const { data: platformRow, error: verifyErr } = await supabase
        .from("review_platforms")
        .select("id")
        .eq("id", platformId)
        .maybeSingle();

    if (verifyErr || !platformRow) {
        throw new Error("Failed to disconnect: permission denied");
    }

    const admin = createAdminClient();

    const { error: hideErr } = await admin
        .from("reviews")
        .update({ is_visible: false })
        .eq("platform_id", platformId);

    if (hideErr) {
        console.error("[disconnectGoogle] hide reviews:", hideErr);
        throw new Error("Failed to disconnect");
    }

    const { error: delErr } = await admin.from("review_platforms").delete().eq("id", platformId);

    if (delErr) {
        console.error("[disconnectGoogle] delete platform:", delErr);
        throw new Error("Failed to disconnect");
    }

    revalidatePath("/(dashboard)/integrations", "page");
    revalidatePath("/(dashboard)/reviews", "page");
    revalidatePath("/integrations", "page");
    revalidatePath("/reviews", "page");

    redirect("/integrations");
}
