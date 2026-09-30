"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { logger } from "@/lib/logger";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";

const businessIdSchema = z.string().uuid();

async function assertCanManageBusiness(businessId: string): Promise<void> {
    const parsed = businessIdSchema.safeParse(businessId);
    if (!parsed.success) throw new Error("Invalid business");

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    if (!(await canManageBusinessIntegration(supabase, user.id, parsed.data))) {
        throw new Error("Forbidden");
    }
}

export async function setSquareAutoSend(
    businessId: string,
    enabled: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
        await assertCanManageBusiness(businessId);
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
        await assertCanManageBusiness(businessId);
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
