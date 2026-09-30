"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";

export async function disconnectGoogle(platformId: string) {
    const parsed = z.string().uuid().safeParse(platformId);
    if (!parsed.success) throw new Error("Invalid integration");
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { data: platformRow, error: platformErr } = await supabase
        .from("review_platforms")
        .select("id, business_id")
        .eq("id", parsed.data)
        .maybeSingle();

    if (platformErr || !platformRow) {
        throw new Error("Integration not found");
    }

    if (!(await canManageBusinessIntegration(supabase, user.id, platformRow.business_id))) {
        throw new Error("Failed to disconnect: permission denied");
    }

    const admin = createAdminClient();

    const { error: hideErr } = await admin
        .from("reviews")
        .update({ is_visible: false })
        .eq("platform_id", parsed.data)
        .eq("business_id", platformRow.business_id);

    if (hideErr) {
        logger.error({ err: hideErr }, "[disconnectGoogle] hide reviews:");
        throw new Error("Failed to disconnect");
    }

    const { error: delErr } = await admin.from("review_platforms").delete()
        .eq("id", parsed.data).eq("business_id", platformRow.business_id);

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
