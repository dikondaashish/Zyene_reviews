import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { pingCompetitorWatchHeartbeat } from "@/lib/monitoring/competitor-watch-heartbeat";
import { generateCompetitorInsight } from "@/domains/ai/services/generateCompetitorInsight";
import { fetchCompetitorMetricsFromGoogle } from "@/services/competitors/external-metrics";
import { sendCompetitorAlertEmail } from "@/lib/notifications/send-competitor-alert-email";

export const dynamic = "force-dynamic";

function isAuthorizedCronRequest(request: Request): boolean {
    const authHeader = request.headers.get("authorization");
    const hasSecret = typeof process.env.CRON_SECRET === "string" && process.env.CRON_SECRET.length > 0;
    return Boolean(hasSecret && authHeader === `Bearer ${process.env.CRON_SECRET}`);
}

function sameUtcDay(aIso: string | null | undefined, b: Date): boolean {
    if (!aIso) return false;
    const a = new Date(aIso);
    return (
        a.getUTCFullYear() === b.getUTCFullYear() &&
        a.getUTCMonth() === b.getUTCMonth() &&
        a.getUTCDate() === b.getUTCDate()
    );
}

const DEFAULT_RATING_ALERT_DELTA = 0.2;
const DEFAULT_REVIEW_SPIKE_THRESHOLD = 20;

export async function GET(request: Request) {
    if (!isAuthorizedCronRequest(request)) {
        await pingCompetitorWatchHeartbeat(false);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const now = new Date();
    const runStartedAt = now.toISOString();
    const runId = crypto.randomUUID();
    let lockAcquired = false;
    const businessExternalUpdates = new Map<string, number>();
    let processedBusinessIds: string[] = [];

    try {
        const { data: lockResult, error: lockErr } = await (admin as any).rpc(
            "acquire_competitor_watch_lock"
        );
        if (lockErr) {
            console.error("[cron/competitor-watch] lock acquire failed:", lockErr);
            await pingCompetitorWatchHeartbeat(false);
            return NextResponse.json({ error: "Lock acquisition failed" }, { status: 500 });
        }
        if (!lockResult) {
            return NextResponse.json(
                { success: true, skipped: true, reason: "already_running" },
                { status: 200 }
            );
        }
        lockAcquired = true;

        const { data: competitors, error: competitorsErr } = await admin
            .from("competitors")
            .select("id, business_id, name, google_url, average_rating, total_reviews")
            .order("created_at", { ascending: false });

        if (competitorsErr) {
            console.error("[cron/competitor-watch] competitors fetch failed:", competitorsErr);
            await pingCompetitorWatchHeartbeat(false);
            return NextResponse.json({ error: competitorsErr.message }, { status: 500 });
        }

        if (!competitors || competitors.length === 0) {
            await pingCompetitorWatchHeartbeat(true);
            return NextResponse.json({
                success: true,
                runId,
                scanned: 0,
                externalUpdates: 0,
                snapshotsCreated: 0,
                eventsCreated: 0,
                insightsCreated: 0,
                message: "No competitors to process",
            });
        }
        processedBusinessIds = Array.from(new Set(competitors.map((c) => c.business_id)));

        const { data: watchSettingsRows } = await (admin.from("competitor_watch_settings" as never) as any)
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
        const { data: existingSnapshots, error: snapshotsErr } = await (admin
            .from("competitor_snapshots" as never) as any)
            .select("id, competitor_id, captured_at, average_rating, total_reviews")
            .in("competitor_id", competitorIds)
            .order("captured_at", { ascending: false });

        if (snapshotsErr) {
            console.error("[cron/competitor-watch] snapshots fetch failed:", snapshotsErr);
            await pingCompetitorWatchHeartbeat(false);
            return NextResponse.json({ error: snapshotsErr.message }, { status: 500 });
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

        const snapshotsToInsert: Array<{
            competitor_id: string;
            business_id: string;
            captured_at: string;
            average_rating: number;
            total_reviews: number;
            source: string;
            metadata: Record<string, unknown>;
        }> = [];
        const eventsToInsert: Array<{
            competitor_id: string;
            business_id: string;
            event_type: string;
            title: string;
            summary: string;
            event_value: number;
            event_delta: number;
            metadata: Record<string, unknown>;
            created_at: string;
        }> = [];
        const appEventsToInsert: Array<{
            organization_id: string;
            business_id: string;
            event_type: string;
            entity_type: string;
            entity_id: string;
            metadata: Record<string, unknown>;
        }> = [];
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
        let externalUpdates = 0;

        for (const competitor of competitors) {
            const latest = latestByCompetitor.get(competitor.id);
            let currRating = Number(competitor.average_rating || 0);
            let currReviews = Number(competitor.total_reviews || 0);

            const liveMetrics = await fetchCompetitorMetricsFromGoogle({
                name: competitor.name,
                googleUrl: (competitor as { google_url?: string | null }).google_url ?? null,
            });
            if (liveMetrics) {
                currRating = Number(liveMetrics.averageRating || 0);
                currReviews = Number(liveMetrics.totalReviews || 0);
                if (
                    currRating !== Number(competitor.average_rating || 0) ||
                    currReviews !== Number(competitor.total_reviews || 0)
                ) {
                    const { error: updErr } = await admin
                        .from("competitors")
                        .update({
                            average_rating: currRating,
                            total_reviews: currReviews,
                            updated_at: now.toISOString(),
                        })
                        .eq("id", competitor.id);
                    if (updErr) {
                        console.error("[cron/competitor-watch] competitor metrics update failed:", updErr);
                    } else {
                        externalUpdates++;
                        businessExternalUpdates.set(
                            competitor.business_id,
                            (businessExternalUpdates.get(competitor.business_id) ?? 0) + 1
                        );
                    }
                }
            }
            const provider = liveMetrics?.provider ?? "db_fallback";
            const providerPlaceId = liveMetrics?.placeId ?? null;
            const prevRating = Number(latest?.average_rating || 0);
            const prevReviews = Number(latest?.total_reviews || 0);
            const ratingDelta = Number((currRating - prevRating).toFixed(1));
            const reviewsDelta = currReviews - prevReviews;

            const sameDay = latest ? sameUtcDay(latest.captured_at, now) : false;
            const unchanged = latest ? ratingDelta === 0 && reviewsDelta === 0 : false;
            if (sameDay && unchanged) {
                continue;
            }

            snapshotsToInsert.push({
                competitor_id: competitor.id,
                business_id: competitor.business_id,
                captured_at: now.toISOString(),
                average_rating: currRating,
                total_reviews: currReviews,
                source: "cron",
                metadata: {
                    previous_rating: prevRating,
                    previous_reviews: prevReviews,
                    rating_delta: ratingDelta,
                    reviews_delta: reviewsDelta,
                    provider,
                    provider_place_id: providerPlaceId,
                },
            });

            if (latest && ratingDelta !== 0) {
                const evt = {
                    competitor_id: competitor.id,
                    business_id: competitor.business_id,
                    event_type: "competitor.rating_changed",
                    title: `${competitor.name} rating changed`,
                    summary: `${competitor.name} rating moved by ${ratingDelta > 0 ? "+" : ""}${ratingDelta} to ${currRating.toFixed(1)}.`,
                    event_value: currRating,
                    event_delta: ratingDelta,
                    metadata: { previous_rating: prevRating, current_rating: currRating },
                    created_at: now.toISOString(),
                };
                eventsToInsert.push(evt);
            }

            if (latest && reviewsDelta !== 0) {
                const evt = {
                    competitor_id: competitor.id,
                    business_id: competitor.business_id,
                    event_type: "competitor.review_count_changed",
                    title: `${competitor.name} review volume changed`,
                    summary: `${competitor.name} review count changed by ${reviewsDelta > 0 ? "+" : ""}${reviewsDelta} to ${currReviews}.`,
                    event_value: currReviews,
                    event_delta: reviewsDelta,
                    metadata: { previous_reviews: prevReviews, current_reviews: currReviews },
                    created_at: now.toISOString(),
                };
                eventsToInsert.push(evt);
            }

            if (latest) {
                const settings = settingsByBusiness.get(competitor.business_id) ?? {
                    rating_alert_delta: DEFAULT_RATING_ALERT_DELTA,
                    review_spike_threshold: DEFAULT_REVIEW_SPIKE_THRESHOLD,
                    email_alerts_enabled: true,
                };
                if (ratingDelta >= settings.rating_alert_delta) {
                    const title = `${competitor.name} rating surge alert`;
                    const summary = `${competitor.name} rating increased by ${ratingDelta.toFixed(1)} (threshold ${settings.rating_alert_delta.toFixed(1)}).`;
                    eventsToInsert.push({
                        competitor_id: competitor.id,
                        business_id: competitor.business_id,
                        event_type: "competitor.alert.rating_surge",
                        title,
                        summary,
                        event_value: currRating,
                        event_delta: ratingDelta,
                        metadata: { threshold: settings.rating_alert_delta, provider },
                        created_at: now.toISOString(),
                    });
                    const orgId = orgByBusiness.get(competitor.business_id);
                    if (orgId) {
                        appEventsToInsert.push({
                            organization_id: orgId,
                            business_id: competitor.business_id,
                            event_type: "competitor.alert.rating_surge",
                            entity_type: "competitor",
                            entity_id: competitor.id,
                            metadata: { name: competitor.name, delta: ratingDelta, threshold: settings.rating_alert_delta },
                        });
                    }
                    if (settings.email_alerts_enabled) {
                        alertEmailQueue.push({
                            businessId: competitor.business_id,
                            title,
                            summary,
                            eventType: "competitor.alert.rating_surge",
                        });
                    }
                }
                if (reviewsDelta >= settings.review_spike_threshold) {
                    const title = `${competitor.name} review spike alert`;
                    const summary = `${competitor.name} review volume increased by ${reviewsDelta} (threshold ${settings.review_spike_threshold}).`;
                    eventsToInsert.push({
                        competitor_id: competitor.id,
                        business_id: competitor.business_id,
                        event_type: "competitor.alert.review_spike",
                        title,
                        summary,
                        event_value: currReviews,
                        event_delta: reviewsDelta,
                        metadata: { threshold: settings.review_spike_threshold, provider },
                        created_at: now.toISOString(),
                    });
                    const orgId = orgByBusiness.get(competitor.business_id);
                    if (orgId) {
                        appEventsToInsert.push({
                            organization_id: orgId,
                            business_id: competitor.business_id,
                            event_type: "competitor.alert.review_spike",
                            entity_type: "competitor",
                            entity_id: competitor.id,
                            metadata: { name: competitor.name, delta: reviewsDelta, threshold: settings.review_spike_threshold },
                        });
                    }
                    if (settings.email_alerts_enabled) {
                        alertEmailQueue.push({
                            businessId: competitor.business_id,
                            title,
                            summary,
                            eventType: "competitor.alert.review_spike",
                        });
                    }
                }
            }

            if (latest && (ratingDelta !== 0 || reviewsDelta !== 0)) {
                const existing = insightInputByCompetitor.get(competitor.id);
                if (!existing) {
                    insightInputByCompetitor.set(competitor.id, {
                        competitorName: competitor.name,
                        businessId: competitor.business_id,
                        ratingNow: currRating,
                        reviewsNow: currReviews,
                        ratingDelta,
                        reviewsDelta,
                        events: [],
                    });
                }
                const input = insightInputByCompetitor.get(competitor.id)!;
                if (ratingDelta !== 0) {
                    input.events.push({
                        title: `${competitor.name} rating changed`,
                        summary: `${competitor.name} rating moved by ${ratingDelta > 0 ? "+" : ""}${ratingDelta} to ${currRating.toFixed(1)}.`,
                        delta: ratingDelta,
                    });
                }
                if (reviewsDelta !== 0) {
                    input.events.push({
                        title: `${competitor.name} review volume changed`,
                        summary: `${competitor.name} review count changed by ${reviewsDelta > 0 ? "+" : ""}${reviewsDelta} to ${currReviews}.`,
                        delta: reviewsDelta,
                    });
                }
            }
        }

        if (snapshotsToInsert.length > 0) {
            const { error: insertSnapshotsErr } = await (admin.from("competitor_snapshots" as never) as any).insert(
                snapshotsToInsert
            );
            if (insertSnapshotsErr) {
                console.error("[cron/competitor-watch] snapshots insert failed:", insertSnapshotsErr);
                await pingCompetitorWatchHeartbeat(false);
                return NextResponse.json({ error: insertSnapshotsErr.message }, { status: 500 });
            }
        }

        if (eventsToInsert.length > 0) {
            const { error: insertEventsErr } = await (admin.from("competitor_events" as never) as any).insert(
                eventsToInsert
            );
            if (insertEventsErr) {
                console.error("[cron/competitor-watch] events insert failed:", insertEventsErr);
                await pingCompetitorWatchHeartbeat(false);
                return NextResponse.json({ error: insertEventsErr.message }, { status: 500 });
            }
        }
        for (const payload of alertEmailQueue) {
            try {
                await sendCompetitorAlertEmail(payload);
            } catch (e) {
                console.error("[cron/competitor-watch] competitor alert email failed:", e);
            }
        }
        if (appEventsToInsert.length > 0) {
            const { error: insertAppEventsErr } = await (admin.from("events" as never) as any).insert(
                appEventsToInsert
            );
            if (insertAppEventsErr) {
                console.error("[cron/competitor-watch] app events insert failed:", insertAppEventsErr);
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
                insightRowsToInsert
            );
            if (insertInsightsErr) {
                console.error("[cron/competitor-watch] insights insert failed:", insertInsightsErr);
            }
        }

        const scannedByBusiness = new Map<string, number>();
        for (const c of competitors) {
            scannedByBusiness.set(c.business_id, (scannedByBusiness.get(c.business_id) ?? 0) + 1);
        }

        const snapshotsByBusiness = new Map<string, number>();
        for (const s of snapshotsToInsert) {
            snapshotsByBusiness.set(s.business_id, (snapshotsByBusiness.get(s.business_id) ?? 0) + 1);
        }

        const eventsByBusiness = new Map<string, number>();
        for (const e of eventsToInsert) {
            eventsByBusiness.set(e.business_id, (eventsByBusiness.get(e.business_id) ?? 0) + 1);
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
            const { error: insertRunsErr } = await (admin.from("competitor_watch_runs" as never) as any).insert(
                runRows
            );
            if (insertRunsErr) {
                console.error("[cron/competitor-watch] run log insert failed:", insertRunsErr);
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
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal server error";
        console.error("[cron/competitor-watch] unexpected error:", error);
        if (processedBusinessIds.length > 0) {
            const failureRows = processedBusinessIds.map((businessId) => ({
                run_id: runId,
                business_id: businessId,
                status: "failed",
                scanned: 0,
                external_updates: 0,
                snapshots_created: 0,
                events_created: 0,
                insights_created: 0,
                error_message: message.slice(0, 500),
                started_at: runStartedAt,
                finished_at: new Date().toISOString(),
            }));
            const { error: failInsertErr } = await (admin.from("competitor_watch_runs" as never) as any).insert(
                failureRows
            );
            if (failInsertErr) {
                console.error("[cron/competitor-watch] failure run log insert failed:", failInsertErr);
            }
        }
        await pingCompetitorWatchHeartbeat(false);
        return NextResponse.json({ error: message }, { status: 500 });
    } finally {
        if (lockAcquired) {
            const { error: unlockErr } = await (admin as any).rpc("release_competitor_watch_lock");
            if (unlockErr) {
                console.error("[cron/competitor-watch] lock release failed:", unlockErr);
            }
        }
    }
}
