/**
 * Builds a URL that opens the business on Google Maps (where public reviews and
 * customer photos are visible). Many businesses store a writereview link; we
 * normalize using place id when present.
 */
export function resolveGoogleMapsListingUrl(input: {
    googleReviewUrl?: string | null;
    platformExternalUrl?: string | null;
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
            return `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}`;
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
