type ExternalCompetitorMetrics = {
    averageRating: number;
    totalReviews: number;
    provider: "google_places";
    placeId: string | null;
};

const GOOGLE_PLACES_SEARCH_ENDPOINT = "https://places.googleapis.com/v1/places:searchText";

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

async function fetchWithTimeout(
    input: string,
    init: RequestInit,
    timeoutMs: number
): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(input, {
            ...init,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeout);
    }
}

export async function fetchCompetitorMetricsFromGoogle(params: {
    name: string;
    googleUrl?: string | null;
    timeoutMs?: number;
    retries?: number;
}): Promise<ExternalCompetitorMetrics | null> {
    const apiKey =
        process.env.GOOGLE_MAPS_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
    if (!apiKey) {
        return null;
    }

    const timeoutMs = params.timeoutMs ?? 8000;
    const retries = Math.max(0, params.retries ?? 2);

    const query = [params.name.trim(), "Google Maps"].filter(Boolean).join(" ");
    const body = JSON.stringify({
        textQuery: query,
        maxResultCount: 1,
    });

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetchWithTimeout(
                GOOGLE_PLACES_SEARCH_ENDPOINT,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Goog-Api-Key": apiKey,
                        "X-Goog-FieldMask": "places.id,places.displayName,places.rating,places.userRatingCount",
                    },
                    body,
                    cache: "no-store",
                },
                timeoutMs
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Places API ${response.status}: ${text.slice(0, 240)}`);
            }

            const payload = (await response.json()) as {
                places?: Array<{
                    id?: string;
                    rating?: number;
                    userRatingCount?: number;
                }>;
            };
            const place = payload.places?.[0];
            if (!place) {
                return null;
            }

            return {
                averageRating: normalizeCompetitorPlacesRating(place.rating),
                totalReviews: normalizeCompetitorPlacesReviewCount(place.userRatingCount),
                provider: "google_places",
                placeId: typeof place.id === "string" ? place.id : null,
            };
        } catch (error) {
            if (attempt >= retries) {
                console.warn("[competitor external metrics] fetch failed:", {
                    name: params.name,
                    hasGoogleUrl: Boolean(params.googleUrl),
                    attempt,
                    error: error instanceof Error ? error.message : String(error),
                });
                return null;
            }
            await wait(300 * (attempt + 1));
        }
    }

    return null;
}
