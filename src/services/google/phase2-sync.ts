import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getValidGoogleToken } from "./sync-service";
import { listAllPlaceActionLinks } from "./place-actions";
import { checkUriLikelyBroken, linkToRow } from "./place-action-link-utils";
import { syncGbpQuestionsForPlatform } from "./phase2-questions-sync";
import * as Sentry from "@sentry/nextjs";
import { reportGoogleSyncFailure } from "./sync-failure-report";

export interface Phase2SyncResult {
    success: boolean;
    questionsUpserted: number;
    placeLinksUpserted: number;
    error?: string;
}

const LINK_CHECK_MAX = 12;

export { syncGbpQuestionsForPlatform } from "./phase2-questions-sync";

/**
 * Syncs place action links; optionally HEAD-checks first N URIs for broken flag.
 */
export async function syncGbpPlaceActionsForPlatform(
    platformId: string,
    options?: { checkLinks?: boolean }
): Promise<{ success: boolean; count: number; error?: string }> {
    const admin = createAdminClient();
    const checkLinks = options?.checkLinks ?? false;

    const { data: platform, error: pErr } = await admin
        .from("review_platforms")
        .select("id, business_id, platform, google_location_id")
        .eq("id", platformId)
        .single();

    if (pErr || !platform || platform.platform !== "google" || !platform.google_location_id) {
        return { success: false, count: 0, error: "Invalid Google platform" };
    }

    try {
        const { accessToken } = await getValidGoogleToken(platformId);
        if (!accessToken) {
            throw new Error("No access token");
        }

        const links = await listAllPlaceActionLinks(accessToken, platform.google_location_id);
        const now = new Date().toISOString();

        const rows = await Promise.all(
            links.reduce<Array<Promise<Awaited<ReturnType<typeof linkToRow>>>>>((acc, link, idx) => {
                if (!link.name) return acc;
                acc.push(
                    (async () => {
                        let broken = false;
                        let lastCheck: string | null = null;
                        if (checkLinks && link.uri && idx < LINK_CHECK_MAX) {
                            broken = await checkUriLikelyBroken(link.uri);
                            lastCheck = now;
                        }
                        return linkToRow(link, platformId, platform.business_id, broken, lastCheck);
                    })()
                );
                return acc;
            }, [])
        );

        if (rows.length === 0) {
            await admin
                .from("review_platforms")
                .update({ google_place_actions_synced_at: new Date().toISOString() })
                .eq("id", platformId);
            return { success: true, count: 0 };
        }

        const { error } = await admin.from("gbp_place_action_links").upsert(rows, {
            onConflict: "review_platform_id,google_link_name",
        });
        if (error) {
            logger.error({ err: error }, "[Phase2] gbp_place_action_links upsert:");
            Sentry.captureException(error);
            throw error;
        }

        await admin
            .from("review_platforms")
            .update({ google_place_actions_synced_at: new Date().toISOString() })
            .eq("id", platformId);

        return { success: true, count: rows.length };
    } catch (e: unknown) {
        const msg = reportGoogleSyncFailure("[Phase2] Place actions", e);
        return { success: false, count: 0, error: msg };
    }
}

export async function syncGooglePhase2ForPlatform(platformId: string): Promise<Phase2SyncResult> {
    const [q, p] = await Promise.all([
        syncGbpQuestionsForPlatform(platformId),
        syncGbpPlaceActionsForPlatform(platformId, { checkLinks: true }),
    ]);

    const success = q.success && p.success;
    return {
        success,
        questionsUpserted: q.count,
        placeLinksUpserted: p.count,
        error: [q.error, p.error].filter(Boolean).join(" | ") || undefined,
    };
}
