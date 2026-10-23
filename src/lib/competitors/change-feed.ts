/**
 * Turns raw competitor events into the few changes an owner should notice.
 * The daily sync logs every +1 review; showing all of them buries the moves
 * that matter (439 of 543 stored events were small review-count ticks).
 */
export type ChangeFeedEvent = {
    id: string;
    competitor_id: string;
    event_type: string;
    event_value: number | null;
    event_delta: number | null;
    created_at: string;
};

export type ChangeFeedItem = { id: string; createdAt: string; text: string; tone: "up" | "down" | "neutral"; isAlert: boolean };

/** Review-count changes smaller than this are routine and hidden. */
export const MIN_REVIEW_CHANGE_SHOWN = 5;

/**
 * PostgREST `or` filter that leaves routine review ticks out of event queries,
 * so a row cap never pushes alerts off the page. Values with dots must be quoted.
 */
export const NOTABLE_COMPETITOR_EVENTS_FILTER =
    `event_type.neq."competitor.review_count_changed",event_delta.gte.${MIN_REVIEW_CHANGE_SHOWN},event_delta.lte.-${MIN_REVIEW_CHANGE_SHOWN}`;

function n(value: number) {
    return Math.abs(value).toLocaleString("en-US");
}

export function describeCompetitorEvent(event: ChangeFeedEvent, competitorName: string): ChangeFeedItem | null {
    const delta = event.event_delta ?? 0;
    const value = event.event_value;
    const base = { id: event.id, createdAt: event.created_at };
    switch (event.event_type) {
        case "competitor.review_count_changed":
            if (Math.abs(delta) < MIN_REVIEW_CHANGE_SHOWN) return null;
            return { ...base, isAlert: false, tone: delta > 0 ? "up" : "down", text: `${competitorName} ${delta > 0 ? "gained" : "lost"} ${n(delta)} reviews.` };
        case "competitor.rating_changed":
            if (delta === 0) return null;
            return { ...base, isAlert: false, tone: delta > 0 ? "up" : "down", text: `${competitorName}'s rating went ${delta > 0 ? "up" : "down"} by ${n(delta)}${value != null ? ` to ${value.toFixed(1)}★` : ""}.` };
        case "competitor.alert.rating_surge":
            return { ...base, isAlert: true, tone: "up", text: `${competitorName}'s rating jumped by ${n(delta)}${value != null ? ` to ${value.toFixed(1)}★` : ""}.` };
        case "competitor.alert.rating_drop":
            return { ...base, isAlert: true, tone: "down", text: `${competitorName}'s rating dropped by ${n(delta)}${value != null ? ` to ${value.toFixed(1)}★` : ""}. Customers may be looking elsewhere.` };
        case "competitor.alert.review_spike":
            return { ...base, isAlert: true, tone: "up", text: `${competitorName} picked up ${n(delta)} reviews in one update. They may be running a review campaign.` };
        case "competitor.added":
            return { ...base, isAlert: false, tone: "neutral", text: `You started tracking ${competitorName}.` };
        default:
            return null;
    }
}

/** An alert and the plain change it was raised from describe one move; keep only the alert. */
const COVERED_BY_ALERT: Record<string, string[]> = {
    "competitor.rating_changed": ["competitor.alert.rating_surge", "competitor.alert.rating_drop"],
    "competitor.review_count_changed": ["competitor.alert.review_spike"],
};

function sameDay(a: string, b: string) {
    return a.slice(0, 10) === b.slice(0, 10);
}

/** Every alert is shown; the limit only trims ordinary changes. */
export function buildChangeFeed(events: ChangeFeedEvent[], nameById: Map<string, string>, limit = 15): ChangeFeedItem[] {
    const deduped = events.filter((e) => {
        const alertTypes = COVERED_BY_ALERT[e.event_type];
        return !alertTypes || !events.some((other) =>
            alertTypes.includes(other.event_type) && other.competitor_id === e.competitor_id && sameDay(other.created_at, e.created_at));
    });
    return deduped
        .map((e) => describeCompetitorEvent(e, nameById.get(e.competitor_id) ?? "A competitor"))
        .filter((item): item is ChangeFeedItem => item !== null)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .filter((item, _, all) => item.isAlert || all.filter((x) => !x.isAlert).indexOf(item) < limit);
}
