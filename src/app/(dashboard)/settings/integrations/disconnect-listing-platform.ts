"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";

const LISTING_PLATFORMS = ["facebook", "yelp"] as const;
const inputSchema = z.object({
    platformId: z.string().uuid(),
    platform: z.enum(LISTING_PLATFORMS),
});

/**
 * Disconnect a Facebook or Yelp listing. Only the `review_platforms` row is deleted:
 * reviews keep showing (platform_id becomes NULL) and a reconnect re-attaches them,
 * because sync upserts on (business_id, platform, external_id).
 */
export async function disconnectListingPlatform(
    platformId: string,
    platform: (typeof LISTING_PLATFORMS)[number],
): Promise<{ ok: true } | { ok: false; error: string }> {
    const parsed = inputSchema.safeParse({ platformId, platform });
    if (!parsed.success) return { ok: false, error: "Invalid integration" };

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { ok: false, error: "Unauthorized" };

        const { data: platformRow, error: platformErr } = await supabase
            .from("review_platforms")
            .select("id, business_id")
            .eq("id", parsed.data.platformId)
            .eq("platform", parsed.data.platform)
            .maybeSingle();
        if (platformErr || !platformRow) return { ok: false, error: "Integration not found" };

        if (!(await canManageBusinessIntegration(supabase, user.id, platformRow.business_id))) {
            return { ok: false, error: "Only owners, admins and managers can disconnect integrations" };
        }

        const { error: delErr } = await createAdminClient().from("review_platforms").delete()
            .eq("id", platformRow.id).eq("business_id", platformRow.business_id);
        if (delErr) {
            logger.error({ err: delErr, platform: parsed.data.platform }, "[disconnectListingPlatform] delete:");
            return { ok: false, error: "Failed to disconnect. Please try again." };
        }

        revalidatePath("/settings/integrations", "page");
        revalidatePath("/reviews", "page");
        return { ok: true };
    } catch (err: unknown) {
        logger.error({ err, platform: parsed.data.platform }, "[disconnectListingPlatform] failed:");
        return { ok: false, error: "Failed to disconnect. Please try again." };
    }
}
