import { fetchWithTimeout } from "@/lib/http/fetch-with-timeout";

import {
    categoryKeywords,
    findComparableCompetitors,
    GENERIC_PLACE_TYPES,
    type BusinessProfile,
    type PlaceCandidate,
} from "@/lib/support-chat/tools/reputation-competitors";

/**
 * Natalie's "check my rating" tool: the visitor's Google rating and review count,
 * plus how genuinely comparable nearby businesses do (see reputation-competitors.ts).
 * Uses Places API (New): one Place Details call and one Nearby or Text Search call.
 */

const PLACES_BASE = "https://places.googleapis.com/v1/places";

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
    /** Up to three nearby businesses in the same category, most-reviewed first. */
    competitors: ReputationPlace[];
}

type PlaceResponse = BusinessProfile & { primaryTypeDisplayName?: { text?: string } };

const toPlace = (p: PlaceCandidate): ReputationPlace => ({
    name: p.displayName?.text?.trim() || "Unnamed business",
    rating: typeof p.rating === "number" ? Math.round(p.rating * 10) / 10 : null,
    reviews: typeof p.userRatingCount === "number" ? p.userRatingCount : 0,
});

/** "Store" says nothing; for generic labels describe the business by its own name instead. */
function categoryLabel(place: PlaceResponse): string | null {
    const label = place.primaryTypeDisplayName?.text?.trim() || null;
    if (place.primaryType && !GENERIC_PLACE_TYPES.has(place.primaryType)) return label;
    const words = categoryKeywords(place);
    return words.length ? words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : label;
}

export async function runReputationCheck(placeId: string): Promise<ReputationCheckResult | null> {
    const apiKey = googleApiKey();
    if (!apiKey) return null;
    const id = placeId.replace(/^places\//, "");
    const response = await fetchWithTimeout(`${PLACES_BASE}/${encodeURIComponent(id)}`, {
        headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,primaryType,primaryTypeDisplayName,types,location,addressComponents",
        },
        cache: "no-store",
    });
    if (!response.ok) return null;
    const place = (await response.json()) as PlaceResponse;
    if (!place.id) return null;

    // Competitors are a bonus; a failed search still returns the visitor's own numbers.
    const competitors = await findComparableCompetitors(apiKey, place).catch(() => []);
    return {
        business: { ...toPlace(place), reviewLink: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(place.id)}` },
        category: categoryLabel(place),
        competitors: competitors.map(toPlace),
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
