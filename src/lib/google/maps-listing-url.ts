/**
 * Link that opens one business's profile on Google Maps. Maps ignores `query_place_id`
 * unless `query` is also set, so a link with only the place id lands on a blank map.
 * The name is the readable fallback; without one, `place_id:` still finds the place.
 */
export function googleMapsPlaceUrl(placeId: string, name?: string | null): string {
    const query = name?.trim() || `place_id:${placeId}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&query_place_id=${encodeURIComponent(placeId)}`;
}

/** Repairs a saved Maps link that has a place id but no `query`, so it opens the profile. */
export function withMapsQuery(url: string, name?: string | null): string {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return url;
    }
    const placeId = parsed.searchParams.get("query_place_id");
    if (!placeId || parsed.searchParams.get("query")) return url;
    return googleMapsPlaceUrl(placeId, name);
}

/**
 * Builds a URL that opens the business on Google Maps (where public reviews and
 * customer photos are visible). Many businesses store a writereview link; we
 * normalize using place id when present.
 */
export function resolveGoogleMapsListingUrl(input: {
    googleReviewUrl?: string | null;
    platformExternalUrl?: string | null;
    businessName?: string | null;
}): string | null {
    const candidates = [input.googleReviewUrl, input.platformExternalUrl].filter(
        (v): v is string => typeof v === "string" && v.trim().length > 0
    );

    for (const raw of candidates) {
        const u = raw.trim();

        if (/goo\.gl\/|maps\.app\.goo\.gl/i.test(u)) {
            return u;
        }

        let parsed: URL;
        try {
            parsed = new URL(u);
        } catch {
            continue;
        }

        const placeId =
            parsed.searchParams.get("placeid") ||
            parsed.searchParams.get("query_place_id");
        if (placeId) {
            return googleMapsPlaceUrl(placeId, input.businessName);
        }

        const host = parsed.hostname;
        const isGoogleMapsPath =
            host === "maps.google.com" ||
            (host.endsWith("google.com") && parsed.pathname.startsWith("/maps"));
        if (isGoogleMapsPath) {
            return u;
        }
    }

    return null;
}
