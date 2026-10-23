/** A nearby business in the owner's Google category that they could start tracking. */
export type CompetitorSuggestion = {
    placeId: string;
    name: string;
    rating: number | null;
    reviews: number;
    distanceMiles: number | null;
    address: string | null;
    /** Opens the business's Google Maps profile; also saved as the competitor's link. */
    mapsUrl: string;
};

export type CompetitorSuggestionsResponse = {
    suggestions: CompetitorSuggestion[];
    /** Why the list is empty: no Google listing to compare against, or Google could not be reached. */
    reason?: "no_listing" | "unavailable";
};
