/**
 * Business types used to suggest campaign templates. The values match the
 * categories offered at signup (see step3-form-categories.ts) minus "other",
 * so a saved category maps straight across.
 */
export const BUSINESS_TYPES = [
    { value: "restaurant", label: "Restaurant", audience: "restaurants" },
    { value: "coffee", label: "Coffee / cafe", audience: "cafes" },
    { value: "salon", label: "Salon / beauty", audience: "salons" },
    { value: "dental", label: "Dental", audience: "dental practices" },
    { value: "gym", label: "Gym / fitness", audience: "gyms and studios" },
    { value: "spa", label: "Spa", audience: "spas" },
    { value: "hotel", label: "Hotel", audience: "hotels" },
    { value: "retail", label: "Retail", audience: "shops" },
    { value: "automotive", label: "Automotive", audience: "auto businesses" },
    { value: "healthcare", label: "Healthcare", audience: "healthcare practices" },
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number]["value"];

const VALUES = new Set<string>(BUSINESS_TYPES.map((t) => t.value));

/** Plural phrase for headings, e.g. "Best for dental practices". */
export function businessTypeAudience(type: BusinessType): string {
    return BUSINESS_TYPES.find((t) => t.value === type)?.audience ?? type;
}

/** A saved category counts only when it is one of the known types; "other" and "uncategorized" do not. */
export function normalizeSavedBusinessType(category: string | null | undefined): BusinessType | null {
    const value = (category ?? "").trim().toLowerCase();
    return VALUES.has(value) ? (value as BusinessType) : null;
}

/**
 * Google's primary category is free text ("Indian restaurant", "Vape shop").
 * Order matters: specific trades are checked before broad ones, so a dental
 * clinic is never filed as healthcare and a coffee shop never as retail.
 */
const GOOGLE_KEYWORDS: Array<[BusinessType, RegExp]> = [
    ["dental", /\b(dent\w*|orthodont\w*|endodont\w*)\b/i],
    ["hotel", /\b(hotel|motel|inn|lodge|resort|hostel|bed (and|&) breakfast)\b/i],
    ["coffee", /\b(coffee|caf[eé]|tea (house|room|shop)|bakery|juice|dessert|ice cream|donut|doughnut)\b/i],
    ["restaurant", /\b(restaurant|pizz\w*|grill|diner|bistro|eatery|bar|pub|brewery|takeout|bbq|barbecue|sushi|taco\w*|steak\w*|burger\w*|food)\b/i],
    ["salon", /\b(salon|barber\w*|beauty|nail\w*|hair\w*|lash\w*|brow\w*|make-?up|tattoo)\b/i],
    ["spa", /\b(spa|massage|sauna|facial\w*|skin care|wellness)\b/i],
    ["gym", /\b(gym|fitness|yoga|pilates|crossfit|martial arts|boxing|personal trainer)\b/i],
    ["automotive", /\b(auto\w*|car|cars|tire\w*|mechanic\w*|body shop|oil change|dealer\w*|detailing|transmission)\b/i],
    ["healthcare", /\b(doctor|clinic|medical|physician|chiropract\w*|physical therap\w*|pharmacy|optometr\w*|veterinar\w*|hospital|health|urgent care)\b/i],
    ["retail", /\b(store|shop|boutique|retail\w*|market|outlet|florist|vape|smoke)\b/i],
];

export function businessTypeFromGoogleCategory(displayName: string | null | undefined): BusinessType | null {
    const text = (displayName ?? "").trim();
    if (!text) return null;
    return GOOGLE_KEYWORDS.find(([, pattern]) => pattern.test(text))?.[0] ?? null;
}
