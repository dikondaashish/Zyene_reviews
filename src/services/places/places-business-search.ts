import { fetchWithTimeout } from "@/lib/http/fetch-with-timeout";
import { industryFromPlaceTypes } from "./place-type-industry";

const PLACES_TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

/** Only what the onboarding form fills in, plus the website for a logo. One request per search; nothing else is fetched on pick. */
const FIELD_MASK = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.addressComponents",
    "places.websiteUri",
    "places.nationalPhoneNumber",
    "places.rating",
    "places.userRatingCount",
    "places.photos.name",
    "places.primaryType",
    "places.types",
].join(",");

export type BusinessPlaceMatch = {
    placeId: string;
    name: string;
    /** One line for the dropdown, e.g. "12 Main St, Mendon, MA 01756, USA". */
    formattedAddress: string;
    street: string;
    city: string;
    /** Two-letter code in the US (MA); the state or province name elsewhere (Ontario). */
    state: string;
    /** ISO two-letter country code, e.g. US. */
    country: string;
    phone: string;
    /** The business's site; BusinessLogo turns it into a logo (or initials). */
    website: string | null;
    rating: number | null;
    reviewCount: number;
    /** First Google photo, as "places/…/photos/…"; /api/places/photo turns it into an image URL. */
    photoName: string | null;
    /** Zyene industry tile from Google's place type, or null when Google's type doesn't clearly match one. */
    industry: string | null;
};

type AddressComponent = { longText?: string; shortText?: string; types?: string[] };
type TextSearchPlace = {
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    addressComponents?: AddressComponent[];
    websiteUri?: string;
    nationalPhoneNumber?: string;
    rating?: number;
    userRatingCount?: number;
    photos?: Array<{ name?: string }>;
    primaryType?: string;
    types?: string[];
};

function component(components: AddressComponent[], type: string, short = false): string {
    const match = components.find((c) => c.types?.includes(type));
    return ((short ? match?.shortText : match?.longText) ?? "").trim();
}

export function toBusinessPlaceMatch(place: TextSearchPlace): BusinessPlaceMatch | null {
    const placeId = place.id?.trim();
    const name = place.displayName?.text?.trim();
    if (!placeId || !name) return null;
    const parts = place.addressComponents ?? [];
    const formattedAddress = place.formattedAddress?.trim() ?? "";
    const street = [component(parts, "street_number"), component(parts, "route")].filter(Boolean).join(" ")
        || formattedAddress.split(",")[0]?.trim() || "";
    const city = component(parts, "locality") || component(parts, "postal_town") || component(parts, "sublocality")
        || component(parts, "administrative_area_level_2");
    const country = component(parts, "country", true).toUpperCase();
    const state = country === "US"
        ? component(parts, "administrative_area_level_1", true).toUpperCase()
        : component(parts, "administrative_area_level_1");
    return {
        placeId,
        name,
        formattedAddress,
        street,
        city,
        state: country === "US" && !/^[A-Z]{2}$/.test(state) ? "" : state.slice(0, 50),
        country: /^[A-Z]{2}$/.test(country) ? country : "",
        phone: place.nationalPhoneNumber?.trim() ?? "",
        website: place.websiteUri?.trim() || null,
        rating: typeof place.rating === "number" ? place.rating : null,
        reviewCount: typeof place.userRatingCount === "number" ? place.userRatingCount : 0,
        photoName: place.photos?.[0]?.name?.trim() || null,
        industry: industryFromPlaceTypes(place.primaryType, place.types ?? []),
    };
}

/** Businesses on Google matching what the owner typed, best match first, favouring the chosen country. */
export async function searchBusinessPlaces(query: string, regionCode = "US"): Promise<BusinessPlaceMatch[]> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
    if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY is not set");

    const response = await fetchWithTimeout(PLACES_TEXT_SEARCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": FIELD_MASK },
        body: JSON.stringify({ textQuery: query, languageCode: "en", regionCode: regionCode.toLowerCase(), pageSize: 5 }),
        cache: "no-store",
    });
    if (!response.ok) {
        throw new Error(`Places text search failed (${response.status}): ${(await response.text()).slice(0, 300)}`);
    }
    const data = (await response.json()) as { places?: TextSearchPlace[] };
    return (data.places ?? []).map(toBusinessPlaceMatch).filter((p): p is BusinessPlaceMatch => p !== null);
}

const PHOTO_NAME = /^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/;

export function isPlacePhotoName(name: string): boolean {
    return PHOTO_NAME.test(name);
}

/** A public, key-free image URL for one Google place photo (Google returns it instead of redirecting). */
export async function fetchPlacePhotoUrl(photoName: string, maxWidthPx = 800): Promise<string | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
    if (!apiKey || !isPlacePhotoName(photoName)) return null;
    const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidthPx}&skipHttpRedirect=true`;
    const response = await fetchWithTimeout(url, { headers: { "X-Goog-Api-Key": apiKey }, cache: "no-store" });
    if (!response.ok) return null;
    const data = (await response.json()) as { photoUri?: string };
    return data.photoUri?.startsWith("https://") ? data.photoUri : null;
}
