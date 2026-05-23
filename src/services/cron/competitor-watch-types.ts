import type { SupabaseClient } from "@supabase/supabase-js";

export type CompetitorWatchScanState = {
    admin: SupabaseClient;
    now: Date;
    settingsByBusiness: Map<string, { rating_alert_delta: number; review_spike_threshold: number; email_alerts_enabled: boolean }>;
    orgByBusiness: Map<string, string>;
    latestByCompetitor: Map<string, { id: string; competitor_id: string; captured_at: string; average_rating: number; total_reviews: number }>;
    snapshotsToInsert: Array<Record<string, unknown>>;
    eventsToInsert: Array<Record<string, unknown>>;
    appEventsToInsert: Array<Record<string, unknown>>;
    alertEmailQueue: Array<{ businessId: string; title: string; summary: string; eventType: string }>;
    insightInputByCompetitor: Map<string, {
        competitorName: string;
        businessId: string;
        ratingNow: number;
        reviewsNow: number;
        ratingDelta: number;
        reviewsDelta: number;
        events: Array<{ title: string; summary?: string | null; delta?: number | null }>;
    }>;
    businessExternalUpdates: Map<string, number>;
    externalUpdates: number;
};
