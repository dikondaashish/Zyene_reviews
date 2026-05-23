import {
    DEFAULT_RATING_ALERT_DELTA,
    DEFAULT_REVIEW_SPIKE_THRESHOLD,
} from "./competitor-watch-helpers";
import type { CompetitorWatchScanState } from "./competitor-watch-types";
import type { CompetitorWatchRowInput } from "./competitor-watch-row-metrics";

export function recordCompetitorWatchRowEvents(
    state: CompetitorWatchScanState,
    competitor: CompetitorWatchRowInput,
    args: {
        hasLatest: boolean;
        currRating: number;
        currReviews: number;
        ratingDelta: number;
        reviewsDelta: number;
        provider: string;
        prevRating: number;
        prevReviews: number;
    },
): void {
    const { hasLatest, currRating, currReviews, ratingDelta, reviewsDelta, provider, prevRating, prevReviews } = args;
    if (!hasLatest) return;

    if (ratingDelta !== 0) {
        state.eventsToInsert.push({
            competitor_id: competitor.id,
            business_id: competitor.business_id,
            event_type: "competitor.rating_changed",
            title: `${competitor.name} rating changed`,
            summary: `${competitor.name} rating moved by ${ratingDelta > 0 ? "+" : ""}${ratingDelta} to ${currRating.toFixed(1)}.`,
            event_value: currRating,
            event_delta: ratingDelta,
            metadata: { previous_rating: prevRating, current_rating: currRating },
            created_at: state.now.toISOString(),
        });
    }

    if (reviewsDelta !== 0) {
        state.eventsToInsert.push({
            competitor_id: competitor.id,
            business_id: competitor.business_id,
            event_type: "competitor.review_count_changed",
            title: `${competitor.name} review volume changed`,
            summary: `${competitor.name} review count changed by ${reviewsDelta > 0 ? "+" : ""}${reviewsDelta} to ${currReviews}.`,
            event_value: currReviews,
            event_delta: reviewsDelta,
            metadata: { previous_reviews: prevReviews, current_reviews: currReviews },
            created_at: state.now.toISOString(),
        });
    }

    const settings = state.settingsByBusiness.get(competitor.business_id) ?? {
        rating_alert_delta: DEFAULT_RATING_ALERT_DELTA,
        review_spike_threshold: DEFAULT_REVIEW_SPIKE_THRESHOLD,
        email_alerts_enabled: true,
    };

    if (ratingDelta >= settings.rating_alert_delta) {
        const title = `${competitor.name} rating surge alert`;
        const summary = `${competitor.name} rating increased by ${ratingDelta.toFixed(1)} (threshold ${settings.rating_alert_delta.toFixed(1)}).`;
        state.eventsToInsert.push({
            competitor_id: competitor.id,
            business_id: competitor.business_id,
            event_type: "competitor.alert.rating_surge",
            title,
            summary,
            event_value: currRating,
            event_delta: ratingDelta,
            metadata: { threshold: settings.rating_alert_delta, provider },
            created_at: state.now.toISOString(),
        });
        const orgId = state.orgByBusiness.get(competitor.business_id);
        if (orgId) {
            state.appEventsToInsert.push({
                organization_id: orgId,
                business_id: competitor.business_id,
                event_type: "competitor.alert.rating_surge",
                entity_type: "competitor",
                entity_id: competitor.id,
                metadata: { name: competitor.name, delta: ratingDelta, threshold: settings.rating_alert_delta },
            });
        }
        if (settings.email_alerts_enabled) {
            state.alertEmailQueue.push({
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
        state.eventsToInsert.push({
            competitor_id: competitor.id,
            business_id: competitor.business_id,
            event_type: "competitor.alert.review_spike",
            title,
            summary,
            event_value: currReviews,
            event_delta: reviewsDelta,
            metadata: { threshold: settings.review_spike_threshold, provider },
            created_at: state.now.toISOString(),
        });
        const orgId = state.orgByBusiness.get(competitor.business_id);
        if (orgId) {
            state.appEventsToInsert.push({
                organization_id: orgId,
                business_id: competitor.business_id,
                event_type: "competitor.alert.review_spike",
                entity_type: "competitor",
                entity_id: competitor.id,
                metadata: { name: competitor.name, delta: reviewsDelta, threshold: settings.review_spike_threshold },
            });
        }
        if (settings.email_alerts_enabled) {
            state.alertEmailQueue.push({
                businessId: competitor.business_id,
                title,
                summary,
                eventType: "competitor.alert.review_spike",
            });
        }
    }

    if (ratingDelta !== 0 || reviewsDelta !== 0) {
        const existing = state.insightInputByCompetitor.get(competitor.id);
        if (!existing) {
            state.insightInputByCompetitor.set(competitor.id, {
                competitorName: competitor.name,
                businessId: competitor.business_id,
                ratingNow: currRating,
                reviewsNow: currReviews,
                ratingDelta,
                reviewsDelta,
                events: [],
            });
        }
        const input = state.insightInputByCompetitor.get(competitor.id)!;
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
