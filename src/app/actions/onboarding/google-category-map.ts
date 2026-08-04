/**
 * Maps Google Business Profile category display names onto Zyene's own
 * category vocabulary. First keyword hit wins, so order within the map
 * is significant for overlapping terms.
 */
const CATEGORY_MAP: Record<string, string> = {
    restaurant: "restaurant", dining: "restaurant", food: "restaurant", eatery: "restaurant",
    pizza: "restaurant", sushi: "restaurant", burger: "restaurant", grill: "restaurant",
    bistro: "restaurant", steakhouse: "restaurant", bakery: "restaurant",
    cafe: "coffee", coffee: "coffee", "coffee shop": "coffee", tea: "coffee", "tea house": "coffee",
    salon: "salon", beauty: "salon", barber: "salon", "hair salon": "salon",
    "nail salon": "salon", cosmetics: "salon",
    dentist: "dental", dental: "dental", orthodontist: "dental",
    gym: "gym", fitness: "gym", "yoga studio": "gym", "pilates studio": "gym",
    "personal trainer": "gym", crossfit: "gym",
    spa: "spa", massage: "spa", wellness: "spa",
    hotel: "hotel", motel: "hotel", resort: "hotel", inn: "hotel", "bed and breakfast": "hotel",
    retail: "retail", store: "retail", shop: "retail", boutique: "retail", market: "retail",
    auto: "automotive", automotive: "automotive", "car dealer": "automotive",
    "car repair": "automotive", mechanic: "automotive", "auto repair": "automotive",
    doctor: "healthcare", hospital: "healthcare", clinic: "healthcare",
    medical: "healthcare", healthcare: "healthcare", pharmacy: "healthcare",
    veterinarian: "healthcare", chiropractor: "healthcare",
};

/** Returns the Zyene category for a Google category display name, or "other". */
export function mapGoogleCategory(displayName: string | null | undefined): string {
    const needle = (displayName || "").toLowerCase();
    for (const [keyword, value] of Object.entries(CATEGORY_MAP)) {
        if (needle.includes(keyword)) return value;
    }
    return "other";
}
