"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { logger } from "@/lib/logger";

const businessIdSchema = z.string().uuid();

async function assertCanAccessBusiness(businessId: string): Promise<void> {
    const parsed = businessIdSchema.safeParse(businessId);
    if (!parsed.success) throw new Error("Invalid business");

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // RLS: readable business ⇒ org or business member
    const { data: biz } = await supabase
        .from("businesses")
        .select("id")
        .eq("id", parsed.data)
        .maybeSingle();
    if (!biz) throw new Error("Forbidden");
}

export async function setSquareAutoSend(
    businessId: string,
    enabled: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
        await assertCanAccessBusiness(businessId);
        const admin = createAdminClient();
        const { data, error } = await admin
            .from("square_connections")
            .update({
                auto_send_enabled: enabled,
                updated_at: new Date().toISOString(),
            })
            .eq("business_id", businessId)
            .is("disconnected_at", null)
            .select("id")
            .maybeSingle();

        if (error) {
            logger.error({ err: error, businessId }, "[square] set auto_send failed");
            return { ok: false, error: "Could not update auto-send." };
        }
        if (!data) return { ok: false, error: "Square is not connected." };

        revalidatePath("/settings/integrations", "page");
        return { ok: true };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed";
        return { ok: false, error: message };
    }
}

export async function disconnectSquare(
    businessId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
        await assertCanAccessBusiness(businessId);
        const admin = createAdminClient();
        const { data, error } = await admin
            .from("square_connections")
            .update({
                disconnected_at: new Date().toISOString(),
                auto_send_enabled: false,
                updated_at: new Date().toISOString(),
            })
            .eq("business_id", businessId)
            .is("disconnected_at", null)
            .select("id")
            .maybeSingle();

        if (error) {
            logger.error({ err: error, businessId }, "[square] disconnect failed");
            return { ok: false, error: "Could not disconnect Square." };
        }
        if (!data) return { ok: false, error: "Square is not connected." };

        revalidatePath("/settings/integrations", "page");
        return { ok: true };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed";
        return { ok: false, error: message };
    }
}
