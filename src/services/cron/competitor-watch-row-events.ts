import {
    DEFAULT_RATING_ALERT_DELTA,
    DEFAULT_REVIEW_SPIKE_THRESHOLD,
} from "./competitor-watch-helpers";
import type { CompetitorWatchScanState } from "./competitor-watch-types";
import type { CompetitorWatchRowInput } from "./competitor-watch-row-metrics";
import { pushCompetitorAlert } from "./competitor-watch-alert";

/** Same cut-off the page uses to hide routine review ticks (lib/competitors/change-feed.ts). */
const MIN_REVIEW_CHANGE_FOR_INSIGHT = 5;

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

    const alert = (eventType: string, title: string, summary: string, value: number, delta: number, threshold: number) =>
        pushCompetitorAlert(state, competitor, { eventType, title, summary, value, delta, threshold, provider, emailEnabled: settings.email_alerts_enabled });

    if (ratingDelta >= settings.rating_alert_delta) {
        alert("competitor.alert.rating_surge", `${competitor.name} rating went up`,
            `${competitor.name}'s Google rating rose by ${ratingDelta.toFixed(1)} to ${currRating.toFixed(1)}.`,
            currRating, ratingDelta, settings.rating_alert_delta);
    }
    // A competitor slipping is as useful to an owner as one surging: it is a window to win their customers.
    if (ratingDelta <= -settings.rating_alert_delta) {
        alert("competitor.alert.rating_drop", `${competitor.name} rating dropped`,
            `${competitor.name}'s Google rating fell by ${Math.abs(ratingDelta).toFixed(1)} to ${currRating.toFixed(1)}.`,
            currRating, ratingDelta, settings.rating_alert_delta);
    }
    if (reviewsDelta >= settings.review_spike_threshold) {
        alert("competitor.alert.review_spike", `${competitor.name} got a burst of reviews`,
            `${competitor.name} gained ${reviewsDelta} reviews since the last check (now ${currReviews}).`,
            currReviews, reviewsDelta, settings.review_spike_threshold);
    }

    // AI write-ups cost money and repeat themselves on +1 review days; only meaningful moves earn one.
    if (ratingDelta !== 0 || Math.abs(reviewsDelta) >= MIN_REVIEW_CHANGE_FOR_INSIGHT) {
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
