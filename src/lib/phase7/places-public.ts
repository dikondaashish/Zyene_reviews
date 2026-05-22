import {
    normalizeCompetitorPlacesRating,
    normalizeCompetitorPlacesReviewCount,
} from "@/services/competitors/external-metrics";

const PLACES_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const PLACES_DETAILS_BASE = "https://places.googleapis.com/v1/places";

function googleApiKey(): string | null {
    return process.env.GOOGLE_MAPS_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim() || null;
}

export type PublicPlaceSuggestion = {
    placeId: string;
    primaryText: string;
    secondaryText: string;
};

export async function searchPublicPlaces(query: string): Promise<PublicPlaceSuggestion[]> {
    const apiKey = googleApiKey();
    if (!apiKey || query.trim().length < 2) return [];

    const response = await fetch(PLACES_AUTOCOMPLETE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
                "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
        },
        body: JSON.stringify({ input: query.trim(), languageCode: "en", regionCode: "us" }),
        cache: "no-store",
    });

    if (!response.ok) return [];

    const data = (await response.json()) as {
        suggestions?: Array<{
            placePrediction?: {
                placeId?: string;
                text?: { text?: string };
                structuredFormat?: {
                    mainText?: { text?: string };
                    secondaryText?: { text?: string };
                };
            };
        }>;
    };

    return (data.suggestions ?? [])
        .map((s) => s.placePrediction)
        .filter((p): p is NonNullable<typeof p> => Boolean(p?.placeId))
        .map((p) => ({
            placeId: String(p.placeId),
            primaryText:
                p.structuredFormat?.mainText?.text?.trim() || p.text?.text?.split(",")[0]?.trim() || "",
            secondaryText: p.structuredFormat?.secondaryText?.text?.trim() || "",
        }))
        .filter((s) => s.primaryText);
}

export type PublicPlaceMetrics = {
    placeId: string;
    name: string;
    averageRating: number;
    totalReviews: number;
    reviewLink: string;
    /** Heuristic: businesses with more reviews often respond more — public estimate only */
    estimatedResponseRatePct: number;
};

export async function fetchPublicPlaceMetrics(placeId: string): Promise<PublicPlaceMetrics | null> {
    const apiKey = googleApiKey();
    if (!apiKey) return null;

    const id = placeId.replace(/^places\//, "");
    const response = await fetch(`${PLACES_DETAILS_BASE}/${id}`, {
        headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "id,displayName,rating,userRatingCount",
        },
        cache: "no-store",
    });

    if (!response.ok) return null;

    const place = (await response.json()) as {
        id?: string;
        displayName?: { text?: string };
        rating?: number;
        userRatingCount?: number;
    };

    const totalReviews = normalizeCompetitorPlacesReviewCount(place.userRatingCount);
    const averageRating = normalizeCompetitorPlacesRating(place.rating);
    const name = place.displayName?.text?.trim() || "Your business";

    const estimatedResponseRatePct =
        totalReviews === 0 ? 0 : Math.min(95, Math.round(35 + Math.log10(totalReviews + 1) * 18));

    return {
        placeId: id,
        name,
        averageRating,
        totalReviews,
        reviewLink: `https://search.google.com/local/writereview?placeid=${id}`,
        estimatedResponseRatePct,
    };
}
