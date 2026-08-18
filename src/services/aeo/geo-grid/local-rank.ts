import type { DataForSeoItem } from "../engines/adapters/dataforseo-client";
import { normalizeForMatch } from "../extraction/brand-text";

/**
 * Finding a business's position in the local pack at one grid point.
 *
 * The number this produces is what the heatmap renders, and its predecessor was
 * fabricated from the business's star rating. So the rules here are strict:
 *
 * - Not appearing yields NULL, never a sentinel. There is no "rank 20" for a
 *   business Google did not list; averaging one in is how "nearly invisible"
 *   becomes "mediocre".
 * - A match is a name match against what Google returned. Nothing is inferred
 *   from ratings, review counts, or proximity.
 */

export type LocalPackEntry = {
    /** 1-based position within the local pack. */
    position: number;
    title: string;
    placeId: string | null;
    rating: number | null;
    reviews: number | null;
};

export type LocalRankResult = {
    /** Null when the business did not appear at all. */
    rankPosition: number | null;
    placeIdFound: string | null;
    /** Everyone Google did list, in order — the competitive picture at this point. */
    topCompetitors: { position: number; name: string; placeId: string | null }[];
    /** How many local-pack slots Google returned here. */
    packSize: number;
};

export function readLocalPack(items: readonly DataForSeoItem[]): LocalPackEntry[] {
    return items
        .filter((item) => item.type === "local_pack" || item.type === "maps_search")
        .map((item, index) => ({
            // rank_group is the position within the pack; fall back to arrival
            // order when the vendor omits it.
            position: item.rank_group ?? index + 1,
            title: item.title?.trim() ?? "",
            placeId: item.place_id?.trim() || null,
            rating: item.rating?.value ?? null,
            reviews: item.rating?.votes_count ?? null,
        }))
        .filter((entry) => entry.title.length > 0);
}

/**
 * Locates the business among local-pack entries.
 *
 * Matching is exact-after-normalisation on the whole entry title, plus a
 * containment check in each direction — Google renders "Radiant Plumbing, Air
 * Conditioning, & Electrical" where the business calls itself "Radiant
 * Plumbing", and a strict equality check would report it as absent.
 *
 * Containment is safe here in a way it is not for free prose: the haystack is a
 * single business name Google returned, not a paragraph, so a match means the
 * listed business IS this brand rather than merely mentioning it.
 */
export function findLocalRank(
    entries: readonly LocalPackEntry[],
    aliases: readonly string[],
    expectedPlaceId?: string | null,
    topN = 3
): LocalRankResult {
    const needles = aliases
        .map((alias) => normalizeForMatch(alias).trim())
        // Same floor as the prose matcher: a two-character name would match
        // almost any listing.
        .filter((alias) => alias.length >= 3);

    let rankPosition: number | null = null;
    let placeIdFound: string | null = null;

    for (const entry of entries) {
        const title = normalizeForMatch(entry.title).trim();
        const hit = expectedPlaceId
            ? entry.placeId === expectedPlaceId
            : needles.some(
                  (needle) => title === needle || title.includes(needle) || needle.includes(title)
              );
        if (hit) {
            // First (best) position wins if a business somehow lists twice.
            rankPosition = rankPosition === null ? entry.position : Math.min(rankPosition, entry.position);
            placeIdFound = entry.placeId;
        }
    }

    return {
        rankPosition,
        placeIdFound,
        topCompetitors: entries
            .filter((entry) => entry.position !== rankPosition)
            .slice(0, topN)
            .map((entry) => ({ position: entry.position, name: entry.title, placeId: entry.placeId })),
        packSize: entries.length,
    };
}
