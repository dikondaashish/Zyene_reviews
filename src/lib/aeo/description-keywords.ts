/**
 * Search terms worth working into a Google business description. Google's own search-term
 * report mixes in people searching for you by name or address, and for other businesses
 * by name; neither belongs in your description, so they are dropped here.
 */

/** Words too common in business names to identify one ("Joe's KC BBQ" is identified by "joes"). */
const GENERIC_NAME_WORDS = new Set([
    "the", "and", "of", "at", "on", "in", "co", "company", "inc", "llc", "ltd", "group", "shop", "store", "house",
    "restaurant", "restaurants", "bar", "grill", "cafe", "coffee", "kitchen", "bistro", "pizza", "pizzeria",
    "bbq", "barbecue", "barbeque", "burger", "burgers", "tacos", "sushi", "bakery", "deli", "diner", "pub",
    "salon", "spa", "studio", "clinic", "dental", "dentist", "auto", "repair", "services", "service", "center",
    "best", "near", "city", "local", "family",
]);

function normalize(text: string): string {
    return text.toLowerCase().replace(/&/g, " and ").replace(/['’]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

/** Distinctive words of a business name, e.g. "Arthur Bryant's Barbeque" → ["arthur", "bryants"]. */
export function distinctiveNameWords(name: string): string[] {
    return normalize(name).split(" ").filter((w) => w.length >= 4 && !GENERIC_NAME_WORDS.has(w));
}

export function isBrandedKeyword(keyword: string, names: string[]): boolean {
    const words = new Set(normalize(keyword).split(" "));
    return names.some((name) => distinctiveNameWords(name).some((w) => words.has(w)));
}

export function filterDescriptionKeywords(
    keywords: string[],
    context: { businessName: string; competitorNames: string[] },
): string[] {
    const names = [context.businessName, ...context.competitorNames].filter(Boolean);
    return keywords.filter((keyword) => {
        // "wolfpack bbq & burgers, east 5th street, kansas city, mo" is someone pasting an address.
        if (keyword.includes(",")) return false;
        return !isBrandedKeyword(keyword, names);
    });
}
