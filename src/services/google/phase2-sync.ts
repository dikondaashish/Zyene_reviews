import { createAdminClient } from "@/lib/db/supabase/admin";
import { getValidGoogleToken } from "./sync-service";
import { listAllQuestions, questionToRow } from "./qanda";
import {
    checkUriLikelyBroken,
    linkToRow,
    listAllPlaceActionLinks,
} from "./place-actions";
import * as Sentry from "@sentry/nextjs";

export interface Phase2SyncResult {
    success: boolean;
    questionsUpserted: number;
    placeLinksUpserted: number;
    error?: string;
}

const LINK_CHECK_MAX = 12;

/**
 * Syncs all Q&A questions for a Google-connected platform into `gbp_questions`.
 */
export async function syncGbpQuestionsForPlatform(platformId: string): Promise<{
    success: boolean;
    count: number;
    error?: string;
}> {
    const admin = createAdminClient();

    const { data: platform, error: pErr } = await admin
        .from("review_platforms")
        .select("id, business_id, platform, google_location_id, google_qa_unavailable")
        .eq("id", platformId)
        .single();

    if (pErr || !platform || platform.platform !== "google" || !platform.google_location_id) {
        return { success: false, count: 0, error: "Invalid Google platform" };
    }

    if (platform.google_qa_unavailable) {
        return { success: true, count: 0 };
    }

    try {
        const { accessToken } = await getValidGoogleToken(platformId);
        if (!accessToken) {
            throw new Error("No access token");
        }

        const questions = await listAllQuestions(accessToken, platform.google_location_id);
        const rows = questions.map((q) => questionToRow(q, platformId, platform.business_id));

        if (rows.length === 0) {
            await admin
                .from("review_platforms")
                .update({
                    google_qa_synced_at: new Date().toISOString(),
                    google_qa_unavailable: true,
                })
                .eq("id", platformId);
            return { success: true, count: 0 };
        }

        const BATCH = 50;
        for (let i = 0; i < rows.length; i += BATCH) {
            const chunk = rows.slice(i, i + BATCH);
            const { error } = await admin.from("gbp_questions").upsert(chunk, {
                onConflict: "review_platform_id,google_question_name",
            });
            if (error) {
                console.error("[Phase2] gbp_questions upsert:", error);
                Sentry.captureException(error);
                throw error;
            }
        }

        await admin
            .from("review_platforms")
            .update({
                google_qa_synced_at: new Date().toISOString(),
                google_qa_unavailable: false,
            })
            .eq("id", platformId);

        return { success: true, count: rows.length };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[Phase2] Q&A sync failed:", msg);
        Sentry.captureException(e);
        return { success: false, count: 0, error: msg };
    }
}

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
            links.filter((link) => link.name).map(async (link, idx) => {
                let broken = false;
                let lastCheck: string | null = null;
                if (checkLinks && link.uri && idx < LINK_CHECK_MAX) {
                    broken = await checkUriLikelyBroken(link.uri);
                    lastCheck = now;
                }
                return linkToRow(link, platformId, platform.business_id, broken, lastCheck);
            })
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
            console.error("[Phase2] gbp_place_action_links upsert:", error);
            Sentry.captureException(error);
            throw error;
        }

        await admin
            .from("review_platforms")
            .update({ google_place_actions_synced_at: new Date().toISOString() })
            .eq("id", platformId);

        return { success: true, count: rows.length };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[Phase2] Place actions sync failed:", msg);
        Sentry.captureException(e);
        return { success: false, count: 0, error: msg };
    }
}

export async function syncGooglePhase2ForPlatform(platformId: string): Promise<Phase2SyncResult> {
    const q = await syncGbpQuestionsForPlatform(platformId);
    const p = await syncGbpPlaceActionsForPlatform(platformId, { checkLinks: true });

    const success = q.success && p.success;
    return {
        success,
        questionsUpserted: q.count,
        placeLinksUpserted: p.count,
        error: [q.error, p.error].filter(Boolean).join(" | ") || undefined,
    };
}
