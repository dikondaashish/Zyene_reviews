import { logger } from "@/lib/logger";
import type { ExternalCompetitorMetrics } from "@/services/competitors/external-metrics";

const GOOGLE_PLACES_SEARCH_ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const GOOGLE_PLACE_DETAILS_ENDPOINT = "https://places.googleapis.com/v1/places/";

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Exported for unit tests (Places API field normalization). */
export function normalizeCompetitorPlacesRating(value: unknown): number {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.min(5, Math.max(0, Number(n.toFixed(1))));
}

/** Exported for unit tests. */
export function normalizeCompetitorPlacesReviewCount(value: unknown): number {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.round(n);
}

/**
 * The place the owner picked when adding a competitor. The add dialog saves
 * `https://www.google.com/maps/search/?api=1&query_place_id=<id>`; older or
 * pasted links may carry `place_id:<id>` or `place_id=<id>` instead.
 */
export function placeIdFromGoogleUrl(googleUrl: string | null | undefined): string | null {
    if (!googleUrl) return null;
    const match = googleUrl.match(/(?:query_place_id=|place_id[:=])([A-Za-z0-9_-]{10,})/);
    return match ? decodeURIComponent(match[1]) : null;
}

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(input, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
}

type PlacePayload = { id?: string; rating?: number; userRatingCount?: number };

/**
 * Exact place first: the owner chose a specific listing, so we read that
 * listing. Searching by name ("Taj Palace Google Maps") and taking the first
 * hit picked up other branches and look-alike names. Name search remains only
 * for competitors added without a picked place.
 */
async function requestPlace(apiKey: string, placeId: string | null, name: string, timeoutMs: number): Promise<PlacePayload | null> {
    const headers = { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey };
    const response = placeId
        ? await fetchWithTimeout(`${GOOGLE_PLACE_DETAILS_ENDPOINT}${encodeURIComponent(placeId)}`, {
            headers: { ...headers, "X-Goog-FieldMask": "id,rating,userRatingCount" },
            cache: "no-store",
        }, timeoutMs)
        : await fetchWithTimeout(GOOGLE_PLACES_SEARCH_ENDPOINT, {
            method: "POST",
            headers: { ...headers, "X-Goog-FieldMask": "places.id,places.displayName,places.rating,places.userRatingCount" },
            body: JSON.stringify({ textQuery: [name.trim(), "Google Maps"].filter(Boolean).join(" "), maxResultCount: 1 }),
            cache: "no-store",
        }, timeoutMs);

    if (placeId && response.status === 404) {
        // The picked listing is gone (closed or merged on Google); name search beats returning nothing forever.
        logger.warn({ placeId, name }, "[competitor external metrics] picked place not found; falling back to name search");
        return requestPlace(apiKey, null, name, timeoutMs);
    }
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Places API ${response.status}: ${text.slice(0, 240)}`);
    }
    const payload = (await response.json()) as PlacePayload & { places?: PlacePayload[] };
    return placeId ? payload : payload.places?.[0] ?? null;
}

export async function fetchCompetitorMetricsFromGoogle(params: {
    name: string;
    googleUrl?: string | null;
    timeoutMs?: number;
    retries?: number;
}): Promise<ExternalCompetitorMetrics | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
    if (!apiKey) return null;

    const timeoutMs = params.timeoutMs ?? 8000;
    const retries = Math.max(0, params.retries ?? 2);
    const placeId = placeIdFromGoogleUrl(params.googleUrl);

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const place = await requestPlace(apiKey, placeId, params.name, timeoutMs);
            if (!place) return null;
            return {
                averageRating: normalizeCompetitorPlacesRating(place.rating),
                totalReviews: normalizeCompetitorPlacesReviewCount(place.userRatingCount),
                provider: "google_places",
                placeId: typeof place.id === "string" ? place.id : placeId,
            };
        } catch (error) {
            if (attempt >= retries) {
                logger.error(
                    {
                        name: params.name,
                        exactPlace: Boolean(placeId),
                        attempt,
                        err: error instanceof Error ? error.message : String(error),
                    },
                    "[competitor external metrics] fetch failed",
                );
                return null;
            }
            await wait(300 * (attempt + 1));
        }
    }
    return null;
}
