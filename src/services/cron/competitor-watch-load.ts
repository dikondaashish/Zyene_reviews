import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { pingCompetitorWatchHeartbeat } from "@/lib/monitoring/competitor-watch-heartbeat";
import { DEFAULT_RATING_ALERT_DELTA, DEFAULT_REVIEW_SPIKE_THRESHOLD } from "./competitor-watch-helpers";
import type { CompetitorWatchScanState } from "./competitor-watch-types";

export type CompetitorRow = {
    id: string;
    business_id: string;
    name: string;
    google_url: string | null;
    average_rating: number | null;
    total_reviews: number | null;
};

export type CompetitorWatchLoadResult =
    | { kind: "error"; response: NextResponse }
    | { kind: "empty"; response: NextResponse }
    | {
          kind: "ready";
          competitors: CompetitorRow[];
          processedBusinessIds: string[];
          scanState: CompetitorWatchScanState;
      };

export async function loadCompetitorWatchScanContext(
    admin: SupabaseClient,
    now: Date,
): Promise<CompetitorWatchLoadResult> {
    const { data: competitors, error: competitorsErr } = await admin
        .from("competitors")
        .select("id, business_id, name, google_url, average_rating, total_reviews")
        .order("created_at", { ascending: false });

    if (competitorsErr) {
        logger.error({ err: competitorsErr }, "[cron/competitor-watch] competitors fetch failed:");
        await pingCompetitorWatchHeartbeat(false);
        return {
            kind: "error",
            response: NextResponse.json({ error: competitorsErr.message }, { status: 500 }),
        };
    }

    if (!competitors || competitors.length === 0) {
        await pingCompetitorWatchHeartbeat(true);
        return {
            kind: "empty",
            response: NextResponse.json({
                success: true,
                runId: crypto.randomUUID(),
                scanned: 0,
                externalUpdates: 0,
                snapshotsCreated: 0,
                eventsCreated: 0,
                insightsCreated: 0,
                message: "No competitors to process",
            }),
        };
    }

    const processedBusinessIds = Array.from(new Set(competitors.map((c) => c.business_id)));

    const { data: watchSettingsRows } = await admin
        .from("competitor_watch_settings")
        .select("business_id, rating_alert_delta, review_spike_threshold, email_alerts_enabled")
        .in("business_id", processedBusinessIds);
    const settingsByBusiness = new Map<
        string,
        { rating_alert_delta: number; review_spike_threshold: number; email_alerts_enabled: boolean }
    >();
    const alertEmailQueue: Array<{
        businessId: string;
        title: string;
        summary: string;
        eventType: string;
    }> = [];
    for (const row of (watchSettingsRows || []) as Array<{
        business_id: string;
        rating_alert_delta: number;
        review_spike_threshold: number;
        email_alerts_enabled?: boolean | null;
    }>) {
        settingsByBusiness.set(row.business_id, {
            rating_alert_delta: Number(row.rating_alert_delta ?? DEFAULT_RATING_ALERT_DELTA),
            review_spike_threshold: Number(row.review_spike_threshold ?? DEFAULT_REVIEW_SPIKE_THRESHOLD),
            email_alerts_enabled: row.email_alerts_enabled !== false,
        });
    }

    const { data: businessOrgRows } = await admin
        .from("businesses")
        .select("id, organization_id")
        .in("id", processedBusinessIds);
    const orgByBusiness = new Map<string, string>();
    for (const row of businessOrgRows || []) {
        if (row.organization_id) orgByBusiness.set(row.id, row.organization_id);
    }

    const competitorIds = competitors.map((c) => c.id);
    const { data: existingSnapshots, error: snapshotsErr } = await admin
        .from("competitor_snapshots")
        .select("id, competitor_id, captured_at, average_rating, total_reviews")
        .in("competitor_id", competitorIds)
        .order("captured_at", { ascending: false });

    if (snapshotsErr) {
        logger.error({ err: snapshotsErr }, "[cron/competitor-watch] snapshots fetch failed:");
        await pingCompetitorWatchHeartbeat(false);
        return {
            kind: "error",
            response: NextResponse.json({ error: snapshotsErr.message }, { status: 500 }),
        };
    }

    const latestByCompetitor = new Map<
        string,
        { id: string; competitor_id: string; captured_at: string; average_rating: number; total_reviews: number }
    >();
    for (const row of (existingSnapshots || []) as Array<{
        id: string;
        competitor_id: string;
        captured_at: string;
        average_rating: number;
        total_reviews: number;
    }>) {
        if (!latestByCompetitor.has(row.competitor_id)) {
            latestByCompetitor.set(row.competitor_id, row);
        }
    }

    const snapshotsToInsert: CompetitorWatchScanState["snapshotsToInsert"] = [];
    const eventsToInsert: CompetitorWatchScanState["eventsToInsert"] = [];
    const appEventsToInsert: CompetitorWatchScanState["appEventsToInsert"] = [];
    const insightInputByCompetitor = new Map<
        string,
        {
            competitorName: string;
            businessId: string;
            ratingNow: number;
            reviewsNow: number;
            ratingDelta: number;
            reviewsDelta: number;
            events: Array<{ title: string; summary?: string | null; delta?: number | null }>;
        }
    >();
    const businessExternalUpdates = new Map<string, number>();

    const scanState: CompetitorWatchScanState = {
        admin,
        now,
        settingsByBusiness,
        orgByBusiness,
        latestByCompetitor,
        snapshotsToInsert,
        eventsToInsert,
        appEventsToInsert,
        alertEmailQueue,
        insightInputByCompetitor,
        businessExternalUpdates,
        externalUpdates: 0,
    };

    return {
        kind: "ready",
        competitors: competitors as CompetitorRow[],
        processedBusinessIds,
        scanState,
    };
}
