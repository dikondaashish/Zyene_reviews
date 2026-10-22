import type { CompetitorWatchScanState } from "./competitor-watch-types";
import type { CompetitorWatchRowInput } from "./competitor-watch-row-metrics";

/** One alert, recorded three ways: the page's change feed, the app event log, and (if on) the team email. */
export function pushCompetitorAlert(
    state: CompetitorWatchScanState,
    competitor: CompetitorWatchRowInput,
    alert: { eventType: string; title: string; summary: string; value: number; delta: number; threshold: number; provider: string; emailEnabled: boolean },
): void {
    state.eventsToInsert.push({
        competitor_id: competitor.id,
        business_id: competitor.business_id,
        event_type: alert.eventType,
        title: alert.title,
        summary: alert.summary,
        event_value: alert.value,
        event_delta: alert.delta,
        metadata: { threshold: alert.threshold, provider: alert.provider },
        created_at: state.now.toISOString(),
    });
    const orgId = state.orgByBusiness.get(competitor.business_id);
    if (orgId) {
        state.appEventsToInsert.push({
            organization_id: orgId,
            business_id: competitor.business_id,
            event_type: alert.eventType,
            entity_type: "competitor",
            entity_id: competitor.id,
            metadata: { name: competitor.name, delta: alert.delta, threshold: alert.threshold },
        });
    }
    if (alert.emailEnabled) {
        state.alertEmailQueue.push({ businessId: competitor.business_id, title: alert.title, summary: alert.summary, eventType: alert.eventType });
    }
}
