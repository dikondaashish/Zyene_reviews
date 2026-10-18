import { fetchWithTimeout } from "@/lib/http/fetch-with-timeout";

/**
 * Natalie's "check my rating" tool: the visitor's Google rating and review count,
 * plus how the nearest same-category businesses compare. Uses Places API (New):
 * one Place Details call and one Nearby Search call.
 */

const PLACES_BASE = "https://places.googleapis.com/v1/places";
const NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby";
const NEARBY_RADIUS_METERS = 5_000;

function googleApiKey(): string | null {
    return process.env.GOOGLE_MAPS_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim() || null;
}

export interface ReputationPlace {
    name: string;
    rating: number | null;
    reviews: number;
}

export interface ReputationCheckResult {
    business: ReputationPlace & { reviewLink: string };
    category: string | null;
    /** Up to three nearby same-category businesses, most-reviewed first. */
    competitors: ReputationPlace[];
}

interface PlaceResponse {
    id?: string;
    displayName?: { text?: string };
    rating?: number;
    userRatingCount?: number;
    primaryType?: string;
    primaryTypeDisplayName?: { text?: string };
    location?: { latitude?: number; longitude?: number };
}

const toPlace = (p: PlaceResponse): ReputationPlace => ({
    name: p.displayName?.text?.trim() || "Unnamed business",
    rating: typeof p.rating === "number" ? Math.round(p.rating * 10) / 10 : null,
    reviews: typeof p.userRatingCount === "number" ? p.userRatingCount : 0,
});

async function nearbyCompetitors(apiKey: string, place: PlaceResponse): Promise<ReputationPlace[]> {
    const { latitude, longitude } = place.location ?? {};
    if (!place.primaryType || typeof latitude !== "number" || typeof longitude !== "number") return [];
    const response = await fetchWithTimeout(NEARBY_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.id,places.displayName,places.rating,places.userRatingCount",
        },
        body: JSON.stringify({
            includedPrimaryTypes: [place.primaryType],
            maxResultCount: 10,
            rankPreference: "POPULARITY",
            locationRestriction: { circle: { center: { latitude, longitude }, radius: NEARBY_RADIUS_METERS } },
        }),
        cache: "no-store",
    });
    if (!response.ok) return [];
    const data = (await response.json()) as { places?: PlaceResponse[] };
    return (data.places ?? [])
        .filter((p) => p.id && p.id !== place.id && typeof p.userRatingCount === "number")
        .map(toPlace)
        .sort((a, b) => b.reviews - a.reviews)
        .slice(0, 3);
}

export async function runReputationCheck(placeId: string): Promise<ReputationCheckResult | null> {
    const apiKey = googleApiKey();
    if (!apiKey) return null;
    const id = placeId.replace(/^places\//, "");
    const response = await fetchWithTimeout(`${PLACES_BASE}/${encodeURIComponent(id)}`, {
        headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,primaryType,primaryTypeDisplayName,location",
        },
        cache: "no-store",
    });
    if (!response.ok) return null;
    const place = (await response.json()) as PlaceResponse;
    if (!place.id) return null;

    // Competitors are a bonus; a failed nearby search still returns the visitor's own numbers.
    const competitors = await nearbyCompetitors(apiKey, place).catch(() => []);
    return {
        business: { ...toPlace(place), reviewLink: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(place.id)}` },
        category: place.primaryTypeDisplayName?.text?.trim() || null,
        competitors,
    };
}

/** One-line takeaway Natalie says under the card. */
export function summarizeReputation(result: ReputationCheckResult): string {
    const { business, competitors } = result;
    const rating = business.rating === null ? "no rating yet" : `${business.rating}★`;
    const top = competitors[0];
    if (!top) {
        return `**${business.name}** has ${rating} from ${business.reviews.toLocaleString("en-US")} Google reviews. Want me to show you how to grow that with automatic review requests?`;
    }
    const gap = top.reviews - business.reviews;
    const comparison = gap > 0
        ? `${top.name} nearby has ${top.reviews.toLocaleString("en-US")}, that's ${gap.toLocaleString("en-US")} more than you.`
        : `You're ahead of ${top.name} nearby (${top.reviews.toLocaleString("en-US")}). Nice work!`;
    return `**${business.name}** has ${rating} from ${business.reviews.toLocaleString("en-US")} Google reviews. ${comparison} Zyene helps local businesses close gaps like this with automatic review requests.`;
}
