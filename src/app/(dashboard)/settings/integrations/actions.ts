"use server";

import { logger } from "@/lib/logger";
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

    const admin = createAdminClient();

    const { data: platformRow, error: platformErr } = await admin
        .from("review_platforms")
        .select("id, business_id")
        .eq("id", platformId)
        .maybeSingle();

    if (platformErr || !platformRow) {
        throw new Error("Integration not found");
    }

    const { data: businessRow, error: businessErr } = await supabase
        .from("businesses")
        .select("id")
        .eq("id", platformRow.business_id)
        .maybeSingle();

    if (businessErr || !businessRow) {
        throw new Error("Failed to disconnect: permission denied");
    }

    const { error: hideErr } = await admin
        .from("reviews")
        .update({ is_visible: false })
        .eq("platform_id", platformId);

    if (hideErr) {
        logger.error({ err: hideErr }, "[disconnectGoogle] hide reviews:");
        throw new Error("Failed to disconnect");
    }

    const { error: delErr } = await admin.from("review_platforms").delete().eq("id", platformId);

    if (delErr) {
        logger.error({ err: delErr }, "[disconnectGoogle] delete platform:");
        throw new Error("Failed to disconnect");
    }

    revalidatePath("/(dashboard)/settings/integrations", "page");
    revalidatePath("/(dashboard)/reviews", "page");
    revalidatePath("/settings/integrations", "page");
    revalidatePath("/reviews", "page");

    redirect("/settings/integrations");
}
