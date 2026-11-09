"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { logger } from "@/lib/logger";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";

type ActionResult = { ok: true } | { ok: false; error: string };

const businessIdSchema = z.string().uuid();

async function assertCanManageBusiness(businessId: string): Promise<string> {
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
    return parsed.data;
}

async function updateActiveCloverConnection(
    businessId: string,
    patch: Record<string, unknown>,
    failMessage: string,
): Promise<ActionResult> {
    try {
        const id = await assertCanManageBusiness(businessId);
        const admin = createAdminClient();
        const { data, error } = await admin
            .from("clover_connections")
            .update({ ...patch, updated_at: new Date().toISOString() } as never)
            .eq("business_id", id)
            .is("disconnected_at", null)
            .select("id")
            .maybeSingle();

        if (error) {
            logger.error({ err: error, businessId: id }, `[clover] ${failMessage}`);
            return { ok: false, error: failMessage };
        }
        if (!data) return { ok: false, error: "Clover is not connected." };

        revalidatePath("/settings/integrations", "page");
        return { ok: true };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed";
        return { ok: false, error: message };
    }
}

export async function setCloverAutoSend(
    businessId: string,
    enabled: boolean,
): Promise<ActionResult> {
    return updateActiveCloverConnection(
        businessId,
        { auto_send_enabled: z.boolean().parse(enabled) },
        "Could not update auto-send.",
    );
}

export async function disconnectClover(businessId: string): Promise<ActionResult> {
    return updateActiveCloverConnection(
        businessId,
        { disconnected_at: new Date().toISOString(), auto_send_enabled: false },
        "Could not disconnect Clover.",
    );
}
