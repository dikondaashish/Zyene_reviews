import { logger } from "@/lib/logger";

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
            logger.error(
                { status: response.status, body: text.slice(0, 200) },
                "[competitor place details] HTTP error",
            );
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
        logger.error(
            { err: e instanceof Error ? e.message : String(e) },
            "[competitor place details] fetch failed",
        );
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

// Live rating/review lookups live in live-metrics.ts; re-exported so existing imports keep working.
export {
    fetchCompetitorMetricsFromGoogle,
    normalizeCompetitorPlacesRating,
    normalizeCompetitorPlacesReviewCount,
    placeIdFromGoogleUrl,
} from "@/services/competitors/live-metrics";
