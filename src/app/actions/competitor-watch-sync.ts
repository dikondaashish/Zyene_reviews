"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { canManageCompetitors } from "@/lib/competitors/watch-access";
import { applyGooglePlacesMetricsToCompetitor } from "@/lib/competitors/apply-google-places-metrics";

/**
 * Owner/admin: pull Google Places metrics for every competitor on this business (same sources as the cron).
 * Logs a row in competitor_watch_runs so "Last Sync Health" updates without waiting for Vercel Cron.
 */
export async function syncCompetitorWatchNow(businessId: string): Promise<{
    success: boolean;
    error?: string;
    scanned?: number;
    snapshots?: number;
    updated?: number;
    apiConfigured?: boolean;
}> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not signed in." };
    }

    const { data: member, error: memErr } = await supabase
        .from("business_members")
        .select("role")
        .eq("business_id", businessId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (memErr || !member || !canManageCompetitors(member.role)) {
        return { success: false, error: "You do not have permission to sync competitors for this business." };
    }

    const hasKey = Boolean(
        process.env.GOOGLE_MAPS_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim()
    );
    if (!hasKey) {
        return {
            success: false,
            error:
                "Google Maps API key is not configured. Add GOOGLE_MAPS_API_KEY (or GOOGLE_API_KEY) on the server.",
            apiConfigured: false,
        };
    }

    const { data: competitors, error: cErr } = await supabase
        .from("competitors")
        .select("id, business_id, name, google_url, average_rating, total_reviews")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

    if (cErr || !competitors?.length) {
        return { success: false, error: cErr?.message || "No competitors to sync." };
    }

    const runId = crypto.randomUUID();
    const startedAt = new Date().toISOString();
    let snapshots = 0;
    let updated = 0;

    const results = await Promise.all(
        competitors.map((row) =>
            applyGooglePlacesMetricsToCompetitor(supabase, {
                id: row.id,
                business_id: row.business_id,
                name: row.name,
                google_url: row.google_url,
                average_rating: row.average_rating,
                total_reviews: row.total_reviews,
            }),
        ),
    );
    for (const r of results) {
        if (r.updated) updated += 1;
        if (r.snapshotInserted) snapshots += 1;
    }

    const finishedAt = new Date().toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated Supabase types
    const { error: runErr } = await supabase.from("competitor_watch_runs").insert({
        run_id: runId,
        business_id: businessId,
        status: "success",
        scanned: competitors.length,
        external_updates: updated,
        snapshots_created: snapshots,
        events_created: 0,
        insights_created: 0,
        error_message: null,
        started_at: startedAt,
        finished_at: finishedAt,
    });

    if (runErr) {
        logger.error({ err: runErr }, "[syncCompetitorWatchNow] run log insert failed");
    }

    revalidatePath("/competitors");
    return {
        success: true,
        scanned: competitors.length,
        snapshots,
        updated,
        apiConfigured: true,
    };
}
