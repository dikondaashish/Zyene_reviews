export type ExternalCompetitorMetrics = {
    averageRating: number;
    totalReviews: number;
    provider: "google_places";
    placeId: string | null;
};

/** Public Google Places fields (Place Details). Not available for competitors' private GBP search terms. */
export type CompetitorPlaceEnrichment = {
    primaryTypeLabel: string | null;
    types: string[];
    websiteUri: string | null;
    editorialSummary: string | null;
    priceLevel: string | null;
    phone: string | null;
};

function localizedText(value: unknown): string | null {
    if (value && typeof value === "object" && "text" in value) {
        const t = (value as { text?: unknown }).text;
        return typeof t === "string" && t.trim() ? t.trim() : null;
    }
    return null;
}

/**
 * Fetch extra public fields for a place (category, website, blurb) using Places API (New) Place Details.
 * `placeResourceName` is typically `places/ChIJ...` from Search Text.
 */
export async function fetchCompetitorPlaceEnrichment(params: {
    placeResourceName: string | null;
    timeoutMs?: number;
}): Promise<CompetitorPlaceEnrichment | null> {
    const placeResourceName = params.placeResourceName?.trim();
    if (!placeResourceName) {
        return null;
    }
    const apiKey =
        process.env.GOOGLE_MAPS_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
    if (!apiKey) {
        return null;
    }

    const name = placeResourceName.startsWith("places/")
        ? placeResourceName
        : `places/${placeResourceName}`;
    const url = `https://places.googleapis.com/v1/${name}`;
    const timeoutMs = params.timeoutMs ?? 8000;

    try {
        const controller = new AbortController();
        const to = setTimeout(() => controller.abort(), timeoutMs);
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask":
                    "primaryTypeDisplayName,types,websiteUri,nationalPhoneNumber,editorialSummary,priceLevel",
            },
            cache: "no-store",
            signal: controller.signal,
        });
        clearTimeout(to);

        if (!response.ok) {
            const text = await response.text();
            console.warn("[competitor place details] HTTP error:", response.status, text.slice(0, 200));
            return null;
        }

        const payload = (await response.json()) as {
            primaryTypeDisplayName?: unknown;
            types?: unknown;
            websiteUri?: unknown;
            nationalPhoneNumber?: unknown;
            editorialSummary?: unknown;
            priceLevel?: unknown;
        };

        const typesRaw = payload.types;
        const types = Array.isArray(typesRaw)
            ? typesRaw.filter((t): t is string => typeof t === "string")
            : [];

        return {
            primaryTypeLabel: localizedText(payload.primaryTypeDisplayName),
            types,
            websiteUri: typeof payload.websiteUri === "string" ? payload.websiteUri : null,
            editorialSummary: localizedText(payload.editorialSummary),
            priceLevel: typeof payload.priceLevel === "string" ? payload.priceLevel : null,
            phone: typeof payload.nationalPhoneNumber === "string" ? payload.nationalPhoneNumber : null,
        };
    } catch (e) {
        console.warn("[competitor place details] fetch failed:", e instanceof Error ? e.message : String(e));
        return null;
    }
}

export function competitorEnrichmentToSnapshotMetadata(
    e: CompetitorPlaceEnrichment
): Record<string, unknown> {
    const summary =
        e.editorialSummary && e.editorialSummary.length > 280
            ? `${e.editorialSummary.slice(0, 277)}…`
            : e.editorialSummary;
    return {
        places_primary_type: e.primaryTypeLabel,
        places_types: e.types.length ? e.types.slice(0, 12) : undefined,
        places_website_uri: e.websiteUri,
        places_editorial_summary: summary,
        places_price_level: e.priceLevel,
        places_phone: e.phone,
    };
}

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
