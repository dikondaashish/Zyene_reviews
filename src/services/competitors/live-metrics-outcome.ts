import { logger } from "@/lib/logger";
import type { ExternalCompetitorMetrics } from "@/services/competitors/external-metrics";
import {
    normalizeCompetitorPlacesRating,
    normalizeCompetitorPlacesReviewCount,
    placeIdFromGoogleUrl,
} from "@/services/competitors/live-metrics";

const SEARCH_ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const DETAILS_ENDPOINT = "https://places.googleapis.com/v1/places/";

/**
 * The live Google read for Competitor Watch, with the reason when there is no data.
 * `fetchCompetitorMetricsFromGoogle` returns null for an outage, a missing key and a
 * healthy "no match" alike; the watch run status must only count the first two as
 * "Google unavailable", or one unmatchable competitor flags every run as failed.
 */
export type CompetitorMetricsOutcome =
    | { kind: "ok"; metrics: ExternalCompetitorMetrics }
    | { kind: "not_found" }
    | { kind: "unavailable"; reason: "no_api_key" | "request_failed" };

type PlacePayload = { id?: string; rating?: number; userRatingCount?: number };

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(input, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
}

/** Same lookup as live-metrics: exact picked place first, name search otherwise or after a 404. */
async function requestPlace(apiKey: string, placeId: string | null, name: string, timeoutMs: number): Promise<PlacePayload | null> {
    const headers = { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey };
    const response = placeId
        ? await fetchWithTimeout(`${DETAILS_ENDPOINT}${encodeURIComponent(placeId)}`, {
            headers: { ...headers, "X-Goog-FieldMask": "id,rating,userRatingCount" },
            cache: "no-store",
        }, timeoutMs)
        : await fetchWithTimeout(SEARCH_ENDPOINT, {
            method: "POST",
            headers: { ...headers, "X-Goog-FieldMask": "places.id,places.displayName,places.rating,places.userRatingCount" },
            body: JSON.stringify({ textQuery: [name.trim(), "Google Maps"].filter(Boolean).join(" "), maxResultCount: 1 }),
            cache: "no-store",
        }, timeoutMs);

    if (placeId && response.status === 404) return requestPlace(apiKey, null, name, timeoutMs);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Places API ${response.status}: ${text.slice(0, 240)}`);
    }
    const payload = (await response.json()) as PlacePayload & { places?: PlacePayload[] };
    return placeId ? payload : payload.places?.[0] ?? null;
}

export async function fetchCompetitorMetricsOutcome(params: {
    name: string;
    googleUrl?: string | null;
    timeoutMs?: number;
    retries?: number;
}): Promise<CompetitorMetricsOutcome> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
    if (!apiKey) return { kind: "unavailable", reason: "no_api_key" };

    const timeoutMs = params.timeoutMs ?? 8000;
    const retries = Math.max(0, params.retries ?? 2);
    const placeId = placeIdFromGoogleUrl(params.googleUrl);

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const place = await requestPlace(apiKey, placeId, params.name, timeoutMs);
            if (!place) return { kind: "not_found" };
            return {
                kind: "ok",
                metrics: {
                    averageRating: normalizeCompetitorPlacesRating(place.rating),
                    totalReviews: normalizeCompetitorPlacesReviewCount(place.userRatingCount),
                    provider: "google_places",
                    placeId: typeof place.id === "string" ? place.id : placeId,
                },
            };
        } catch (error) {
            if (attempt >= retries) {
                logger.error(
                    { name: params.name, exactPlace: Boolean(placeId), attempt, err: error instanceof Error ? error.message : String(error) },
                    "[competitor external metrics] fetch failed",
                );
                return { kind: "unavailable", reason: "request_failed" };
            }
            await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
        }
    }
    return { kind: "unavailable", reason: "request_failed" };
}
