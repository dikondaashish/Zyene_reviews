import "server-only";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { redis } from "@/lib/db/redis";
import { fetchWithTimeout } from "@/lib/http/fetch-with-timeout";
import { googleMapsPlaceUrl } from "@/lib/google/maps-listing-url";
import { normalizeBusinessNameForCompare } from "@/lib/competitors/own-business-guard";
import { placeIdFromGoogleUrl } from "@/services/competitors/live-metrics";
import { distanceKm, findComparableCompetitors, type BusinessProfile, type PlaceCandidate } from "@/lib/support-chat/tools/reputation-competitors";
import type { CompetitorSuggestion } from "@/lib/competitors/competitor-suggestion-types";

/**
 * Nearby businesses like the owner's (same Google category, most-reviewed first) for owners
 * who don't know who to track. Built on the chat's comparable-business search, and cached
 * for a day per business so reopening the page costs no Places calls.
 */

const PLACES_BASE = "https://places.googleapis.com/v1/places";
const PROFILE_FIELDS = "id,displayName,primaryType,types,location,addressComponents";
/** Extra candidates so the list still has some left after removing ones already tracked. */
const CANDIDATE_LIMIT = 8;
export const SUGGESTIONS_SHOWN = 6;
const CACHE_SECONDS = 24 * 60 * 60;
const KM_PER_MILE = 1.609344;

const cachedSchema = z.object({
    key: z.string(),
    suggestions: z.array(z.object({
        placeId: z.string(), name: z.string(), rating: z.number().nullable(), reviews: z.number(),
        distanceMiles: z.number().nullable(), address: z.string().nullable(), mapsUrl: z.string(),
    })),
});

const PLACE_ID_LIKE = /ChIJ[A-Za-z0-9_-]{10,}/;

/** The owner's Google place id from their review link or connected listing, if either carries one. */
export function ownPlaceIdFromUrls(urls: Array<string | null | undefined>): string | null {
    for (const raw of urls) {
        const url = raw?.trim();
        if (!url) continue;
        try {
            const params = new URL(url).searchParams;
            const fromParam = params.get("placeid") || params.get("query_place_id");
            if (fromParam?.trim()) return fromParam.trim();
        } catch {
            /* not an absolute URL; the patterns below still apply */
        }
        const found = placeIdFromGoogleUrl(url) ?? url.match(PLACE_ID_LIKE)?.[0];
        if (found) return found;
    }
    return null;
}

export function toSuggestion(owner: BusinessProfile, place: PlaceCandidate): CompetitorSuggestion | null {
    const name = place.displayName?.text?.trim();
    if (!place.id || !name) return null;
    const km = distanceKm(owner.location, place.location);
    return {
        placeId: place.id,
        name,
        rating: typeof place.rating === "number" ? Math.round(place.rating * 10) / 10 : null,
        reviews: typeof place.userRatingCount === "number" ? place.userRatingCount : 0,
        distanceMiles: Number.isFinite(km) ? Math.round((km / KM_PER_MILE) * 10) / 10 : null,
        address: place.shortFormattedAddress?.trim() || null,
        mapsUrl: googleMapsPlaceUrl(place.id, name),
    };
}

/** Drops the owner's own listing and anything already tracked, by place id or by name. */
export function withoutTracked(
    suggestions: CompetitorSuggestion[],
    tracked: Array<{ name: string; google_url: string | null }>,
    own: { name: string; placeId: string | null },
): CompetitorSuggestion[] {
    const ids = new Set(tracked.map((c) => placeIdFromGoogleUrl(c.google_url)).filter(Boolean));
    if (own.placeId) ids.add(own.placeId);
    const names = new Set([own.name, ...tracked.map((c) => c.name)].map(normalizeBusinessNameForCompare).filter((n) => n.length >= 3));
    return suggestions.filter((s) => !ids.has(s.placeId) && !names.has(normalizeBusinessNameForCompare(s.name)));
}

async function placesFetch<T>(url: string, apiKey: string, fieldMask: string, body?: object): Promise<T | null> {
    const response = await fetchWithTimeout(url, {
        method: body ? "POST" : "GET",
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": fieldMask },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
    });
    return response.ok ? ((await response.json()) as T) : null;
}

/** The owner's own listing: by place id when known, else the best text match for name and city. */
async function ownerProfile(apiKey: string, placeId: string | null, nameAndCity: string): Promise<BusinessProfile | null> {
    if (placeId) return placesFetch<BusinessProfile>(`${PLACES_BASE}/${encodeURIComponent(placeId)}`, apiKey, PROFILE_FIELDS);
    const found = await placesFetch<{ places?: BusinessProfile[] }>(`${PLACES_BASE}:searchText`, apiKey,
        PROFILE_FIELDS.split(",").map((f) => `places.${f}`).join(","), { textQuery: nameAndCity, pageSize: 1 });
    return found?.places?.[0] ?? null;
}

const redisReady = () => Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

export type SuggestionsLookup = { status: "ok"; suggestions: CompetitorSuggestion[] } | { status: "no_listing" | "unavailable" };

/** Comparable nearby businesses for one business, before removing the ones it already tracks. */
export async function lookupCompetitorSuggestions(input: {
    businessId: string; name: string; city: string | null; placeId: string | null;
}): Promise<SuggestionsLookup> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
    if (!apiKey) return { status: "unavailable" };
    const nameAndCity = [input.name, input.city].filter(Boolean).join(" ").trim();
    if (!input.placeId && !input.city) return { status: "no_listing" };
    const cacheKey = `competitor_suggestions_v1:${input.businessId}`;
    const key = input.placeId ?? `text:${nameAndCity.toLowerCase()}`;

    if (redisReady()) {
        try {
            const hit = cachedSchema.safeParse(await redis.get(cacheKey));
            if (hit.success && hit.data.key === key) return { status: "ok", suggestions: hit.data.suggestions };
        } catch (err) {
            logger.warn({ err }, "competitor suggestions cache read failed");
        }
    }

    try {
        const owner = await ownerProfile(apiKey, input.placeId, nameAndCity);
        if (!owner?.id) return { status: "no_listing" };
        const places = await findComparableCompetitors(apiKey, owner, CANDIDATE_LIMIT);
        const suggestions = places.map((p) => toSuggestion(owner, p)).filter((s): s is CompetitorSuggestion => s !== null);
        if (redisReady()) await redis.set(cacheKey, { key, suggestions }, { ex: CACHE_SECONDS }).catch(() => undefined);
        return { status: "ok", suggestions };
    } catch (err) {
        logger.warn({ err, businessId: input.businessId }, "competitor suggestions lookup failed");
        return { status: "unavailable" };
    }
}
