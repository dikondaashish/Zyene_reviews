import { fetchWithTimeout } from "@/lib/http/fetch-with-timeout";

/**
 * Finds businesses that are genuinely comparable to the visitor's: same specific
 * category, close by. Google often labels small shops with a generic type such as
 * "store", and a nearby search on that returns car dealers and anything else with
 * a storefront, so generic types fall back to a keyword search built from the
 * business's own name, and every candidate must match the category exactly.
 */

const NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby";
const TEXT_URL = "https://places.googleapis.com/v1/places:searchText";
const SEARCH_RADIUS_METERS = 8_000;
/** Candidates beyond this are not "nearby" to a local customer. */
export const MAX_COMPETITOR_DISTANCE_KM = 15;
const CANDIDATE_FIELDS = "places.id,places.displayName,places.rating,places.userRatingCount,places.primaryType,places.types,places.location";

/** Types too broad to compare on: matching them lumps unrelated businesses together. */
export const GENERIC_PLACE_TYPES = new Set([
    "store", "establishment", "point_of_interest", "food", "health", "service", "finance",
    "general_contractor", "premise", "business", "local_business", "shopping_mall",
]);

const NAME_STOPWORDS = new Set(["the", "and", "of", "llc", "inc", "co", "company", "ltd", "corp", "group", "a", "an", "at", "by"]);

export interface PlaceCandidate {
    id?: string;
    displayName?: { text?: string };
    rating?: number;
    userRatingCount?: number;
    primaryType?: string;
    types?: string[];
    location?: { latitude?: number; longitude?: number };
}

export interface BusinessProfile extends PlaceCandidate {
    addressComponents?: Array<{ longText?: string; types?: string[] }>;
}

/** The most specific category Google gives the business, or null if it only has generic ones. */
export function specificPlaceType(place: BusinessProfile): string | null {
    if (place.primaryType && !GENERIC_PLACE_TYPES.has(place.primaryType)) return place.primaryType;
    return place.types?.find((type) => !GENERIC_PLACE_TYPES.has(type)) ?? null;
}

/** "Mendon Vape & Smoke Shop" in Mendon -> "vape smoke shop": what the business is, minus where. */
export function categoryKeywords(place: BusinessProfile): string[] {
    const placeWords = new Set(
        (place.addressComponents ?? [])
            .filter((c) => c.types?.some((t) => t === "locality" || t === "sublocality" || t === "neighborhood" || t === "administrative_area_level_2"))
            .flatMap((c) => (c.longText ?? "").toLowerCase().split(/\s+/)),
    );
    return (place.displayName?.text ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2 && !NAME_STOPWORDS.has(word) && !placeWords.has(word) && !/^\d+$/.test(word));
}

export function distanceKm(a: PlaceCandidate["location"], b: PlaceCandidate["location"]): number {
    if (a?.latitude === undefined || a.longitude === undefined || b?.latitude === undefined || b.longitude === undefined) return Infinity;
    const rad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = rad(b.latitude - a.latitude);
    const dLng = rad(b.longitude - a.longitude);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** A candidate counts only if it is in the same category and genuinely nearby. */
export function isComparable(business: BusinessProfile, candidate: PlaceCandidate, type: string | null): boolean {
    if (!candidate.id || candidate.id === business.id || typeof candidate.userRatingCount !== "number") return false;
    if (distanceKm(business.location, candidate.location) > MAX_COMPETITOR_DISTANCE_KM) return false;
    if (type) return candidate.primaryType === type || (candidate.types ?? []).includes(type);
    // Generic-only business: the candidate must carry the same generic label, not a specific
    // one of its own (a car dealer also has "store" in its types, but its primary type differs).
    return !!business.primaryType && candidate.primaryType === business.primaryType;
}

async function placesPost(url: string, apiKey: string, body: Record<string, unknown>): Promise<PlaceCandidate[]> {
    const response = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": CANDIDATE_FIELDS },
        body: JSON.stringify(body),
        cache: "no-store",
    });
    if (!response.ok) return [];
    const data = (await response.json()) as { places?: PlaceCandidate[] };
    return data.places ?? [];
}

export async function findComparableCompetitors(apiKey: string, business: BusinessProfile): Promise<PlaceCandidate[]> {
    const { latitude, longitude } = business.location ?? {};
    if (typeof latitude !== "number" || typeof longitude !== "number") return [];
    const circle = { center: { latitude, longitude }, radius: SEARCH_RADIUS_METERS };
    const type = specificPlaceType(business);

    let candidates: PlaceCandidate[];
    if (type) {
        candidates = await placesPost(NEARBY_URL, apiKey, {
            includedTypes: [type], maxResultCount: 20, rankPreference: "POPULARITY", locationRestriction: { circle },
        });
    } else {
        const keywords = categoryKeywords(business);
        if (keywords.length === 0) return [];
        candidates = await placesPost(TEXT_URL, apiKey, { textQuery: keywords.join(" "), pageSize: 20, locationBias: { circle } });
    }
    return candidates
        .filter((candidate) => isComparable(business, candidate, type))
        .sort((a, b) => (b.userRatingCount ?? 0) - (a.userRatingCount ?? 0))
        .slice(0, 3);
}
