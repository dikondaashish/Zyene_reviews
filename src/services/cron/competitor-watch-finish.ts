import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { pingCompetitorWatchHeartbeat } from "@/lib/monitoring/competitor-watch-heartbeat";
import { generateCompetitorInsight } from "@/domains/ai/services/generateCompetitorInsight";
import { sendCompetitorAlertEmail } from "@/lib/notifications/send-competitor-alert-email";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function finalizeCompetitorWatchRun(params: {
    admin: SupabaseClient;
    now: Date;
    runId: string;
    runStartedAt: string;
    competitors: Array<{ id: string; business_id: string; name: string }>;
    processedBusinessIds: string[];
    snapshotsToInsert: Array<Record<string, unknown>>;
    eventsToInsert: Array<Record<string, unknown>>;
    appEventsToInsert: Array<Record<string, unknown>>;
    alertEmailQueue: Array<{ businessId: string; title: string; summary: string; eventType: string }>;
    insightInputByCompetitor: Map<
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
    >;
    businessExternalUpdates: Map<string, number>;
    externalUpdates: number;
}): Promise<NextResponse> {
    const { admin, now, runId, runStartedAt, competitors, processedBusinessIds } = params;
    const {
        snapshotsToInsert,
        eventsToInsert,
        appEventsToInsert,
        alertEmailQueue,
        insightInputByCompetitor,
        businessExternalUpdates,
        externalUpdates,
    } = params;

    if (snapshotsToInsert.length > 0) {
        const { error: insertSnapshotsErr } = await (admin.from("competitor_snapshots" as never) as any).insert(
            snapshotsToInsert,
        );
        if (insertSnapshotsErr) {
            logger.error({ err: insertSnapshotsErr }, "[cron/competitor-watch] snapshots insert failed:");
            await pingCompetitorWatchHeartbeat(false);
            return NextResponse.json({ error: insertSnapshotsErr.message }, { status: 500 });
        }
    }

    if (eventsToInsert.length > 0) {
        const { error: insertEventsErr } = await (admin.from("competitor_events" as never) as any).insert(
            eventsToInsert,
        );
        if (insertEventsErr) {
            logger.error({ err: insertEventsErr }, "[cron/competitor-watch] events insert failed:");
            await pingCompetitorWatchHeartbeat(false);
            return NextResponse.json({ error: insertEventsErr.message }, { status: 500 });
        }
    }

    for (const payload of alertEmailQueue) {
        try {
            await sendCompetitorAlertEmail(payload);
        } catch (e) {
            logger.error({ err: e }, "[cron/competitor-watch] competitor alert email failed:");
        }
    }

    if (appEventsToInsert.length > 0) {
        const { error: insertAppEventsErr } = await (admin.from("events" as never) as any).insert(appEventsToInsert);
        if (insertAppEventsErr) {
            logger.error({ err: insertAppEventsErr }, "[cron/competitor-watch] app events insert failed:");
        }
    }

    const insightRowsToInsert: Array<{
        competitor_id: string;
        business_id: string;
        range_key: string;
        summary: string;
        priority: string;
        confidence: number;
        why_it_matters: string;
        owner_suggestion: string;
        actions: Array<{ title: string; impact: string; effort: string; priority: string }>;
        recommendations: string[];
        model: string;
        created_at: string;
    }> = [];

    for (const [competitorId, input] of insightInputByCompetitor.entries()) {
        const insight = await generateCompetitorInsight({
            competitorName: input.competitorName,
            ratingNow: input.ratingNow,
            reviewsNow: input.reviewsNow,
            ratingDelta: input.ratingDelta,
            reviewsDelta: input.reviewsDelta,
            events: input.events,
        });
        if (!insight) continue;
        insightRowsToInsert.push({
            competitor_id: competitorId,
            business_id: input.businessId,
            range_key: "30d",
            summary: insight.summary,
            priority: insight.priority,
            confidence: Number(insight.confidence.toFixed(2)),
            why_it_matters: insight.whyItMatters,
            owner_suggestion: insight.ownerSuggestion,
            actions: insight.actions,
            recommendations: insight.recommendations,
            model: process.env.GOOGLE_AI_LITE_MODEL?.trim() || "gemini-3.1-flash-lite-preview",
            created_at: now.toISOString(),
        });
    }

    if (insightRowsToInsert.length > 0) {
        const { error: insertInsightsErr } = await (admin.from("competitor_insights" as never) as any).insert(
            insightRowsToInsert,
        );
        if (insertInsightsErr) {
            logger.error({ err: insertInsightsErr }, "[cron/competitor-watch] insights insert failed:");
        }
    }

    const scannedByBusiness = new Map<string, number>();
    for (const c of competitors) {
        scannedByBusiness.set(c.business_id, (scannedByBusiness.get(c.business_id) ?? 0) + 1);
    }

    const snapshotsByBusiness = new Map<string, number>();
    for (const s of snapshotsToInsert) {
        snapshotsByBusiness.set(s.business_id as string, (snapshotsByBusiness.get(s.business_id as string) ?? 0) + 1);
    }

    const eventsByBusiness = new Map<string, number>();
    for (const e of eventsToInsert) {
        eventsByBusiness.set(e.business_id as string, (eventsByBusiness.get(e.business_id as string) ?? 0) + 1);
    }

    const insightsByBusiness = new Map<string, number>();
    for (const i of insightRowsToInsert) {
        insightsByBusiness.set(i.business_id, (insightsByBusiness.get(i.business_id) ?? 0) + 1);
    }

    const finishedAt = new Date().toISOString();
    const runRows = processedBusinessIds.map((businessId) => ({
        run_id: runId,
        business_id: businessId,
        status: "success",
        scanned: scannedByBusiness.get(businessId) ?? 0,
        external_updates: businessExternalUpdates.get(businessId) ?? 0,
        snapshots_created: snapshotsByBusiness.get(businessId) ?? 0,
        events_created: eventsByBusiness.get(businessId) ?? 0,
        insights_created: insightsByBusiness.get(businessId) ?? 0,
        error_message: null,
        started_at: runStartedAt,
        finished_at: finishedAt,
    }));

    if (runRows.length > 0) {
        const { error: insertRunsErr } = await (admin.from("competitor_watch_runs" as never) as any).insert(runRows);
        if (insertRunsErr) {
            logger.error({ err: insertRunsErr }, "[cron/competitor-watch] run log insert failed:");
        }
    }

    await pingCompetitorWatchHeartbeat(true);

    return NextResponse.json({
        success: true,
        runId,
        scanned: competitors.length,
        externalUpdates,
        snapshotsCreated: snapshotsToInsert.length,
        eventsCreated: eventsToInsert.length,
        insightsCreated: insightRowsToInsert.length,
    });
}
