/**
 * Optional fields we attach to competitor_snapshots.metadata after a Places Details fetch.
 * Competitors do not expose GBP "search keywords" without their account; these are public listing fields.
 */
export type CompetitorPlacesEnrichmentMeta = {
    places_primary_type?: string | null;
    places_types?: string[];
    places_website_uri?: string | null;
    places_editorial_summary?: string | null;
    places_price_level?: string | null;
    places_phone?: string | null;
};

export function parsePlacesMetaFromSnapshot(
    metadata: Record<string, unknown> | null | undefined
): {
    primaryType: string | null;
    typesPreview: string | null;
    websiteUrl: string | null;
    summary: string | null;
    priceLevel: string | null;
} | null {
    if (!metadata || typeof metadata !== "object") return null;
    const m = metadata as CompetitorPlacesEnrichmentMeta;
    const types = Array.isArray(m.places_types) ? m.places_types.filter((t) => typeof t === "string") : [];
    const typesPreview =
        types.length > 0
            ? types
                  .slice(0, 5)
                  .map((t) => t.replace(/_/g, " "))
                  .join(" · ")
            : null;
    return {
        primaryType: m.places_primary_type ?? null,
        typesPreview,
        websiteUrl: m.places_website_uri ?? null,
        summary: m.places_editorial_summary ?? null,
        priceLevel: m.places_price_level ? formatPriceLevel(m.places_price_level) : null,
    };
}

export type CompetitorPlacesRowMeta = NonNullable<ReturnType<typeof parsePlacesMetaFromSnapshot>>;

function formatPriceLevel(raw: string): string {
    const map: Record<string, string> = {
        PRICE_LEVEL_FREE: "Free",
        PRICE_LEVEL_INEXPENSIVE: "Inexpensive",
        PRICE_LEVEL_MODERATE: "Moderate",
        PRICE_LEVEL_EXPENSIVE: "Expensive",
        PRICE_LEVEL_VERY_EXPENSIVE: "Very expensive",
    };
    return map[raw] ?? raw.replace(/^PRICE_LEVEL_/, "").replace(/_/g, " ").toLowerCase();
}
