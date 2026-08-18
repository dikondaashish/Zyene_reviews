import { fetchWithRetry } from "./business-profile";
import { requireGoogleLocationId } from "./location-id";

const BASE = "https://mybusinessbusinessinformation.googleapis.com/v1";

/** Fields needed for profile health + listing editor (Business Information API v1). */
export const LOCATION_READ_MASK = [
    "name",
    "title",
    "websiteUri",
    "phoneNumbers",
    "profile",
    "regularHours",
    "categories",
    "storefrontAddress",
    "metadata",
    // Read for the GBP audit (F5.10). Both are top-level Location fields; a
    // readMask that omits them makes Google return them absent rather than
    // error, which is indistinguishable from a business that has none — so
    // leaving them out would have the audit report "no services" for every
    // customer.
    "serviceItems",
    "serviceArea",
    // Centre point for the geo-grid (F1.12). Google's own coordinate for the
    // listing is the only defensible centre — geocoding the address ourselves
    // would put the grid somewhere Google does not think the business is.
    "latlng",
].join(",");

export interface GoogleLocationPhoneNumbers {
    primaryPhone?: string;
}

export interface GoogleLocationProfile {
    description?: string;
}

export interface GoogleLocationRegularHours {
    periods?: Array<{ openDay?: string; openTime?: unknown; closeDay?: string; closeTime?: unknown }>;
}

/** A label carries the merchant-authored name and optional description. */
export interface GoogleServiceLabel {
    displayName?: string;
    description?: string;
    languageCode?: string;
}

/**
 * One offered service. Google models these as a union: `structuredServiceItem`
 * for services picked from its taxonomy, `freeFormServiceItem` for ones the
 * merchant typed. Descriptions live in a different place on each.
 */
export interface GoogleServiceItem {
    price?: { currencyCode?: string; units?: string; nanos?: number };
    structuredServiceItem?: { serviceTypeId?: string; description?: string };
    freeFormServiceItem?: { category?: string; label?: GoogleServiceLabel };
}

/**
 * Where a service-area business operates. Google's v1 model is a set of place
 * ids (max 20), not a radius — the older radius-based model does not exist on
 * this API.
 */
export interface GoogleServiceArea {
    businessType?:
        | "BUSINESS_TYPE_UNSPECIFIED"
        | "CUSTOMER_LOCATION_ONLY"
        | "CUSTOMER_AND_BUSINESS_LOCATION";
    places?: { placeInfos?: Array<{ placeName?: string; placeId?: string }> };
    regionCode?: string;
}

export interface GoogleLocationFull {
    name?: string;
    title?: string;
    websiteUri?: string;
    phoneNumbers?: GoogleLocationPhoneNumbers;
    profile?: GoogleLocationProfile;
    regularHours?: GoogleLocationRegularHours;
    serviceItems?: GoogleServiceItem[];
    serviceArea?: GoogleServiceArea;
    /** Google's coordinate for the listing. Absent on unverified locations. */
    latlng?: { latitude?: number; longitude?: number };
    categories?: { primaryCategory?: { displayName?: string; name?: string } };
    storefrontAddress?: {
        addressLines?: string[];
        locality?: string;
        administrativeArea?: string;
        postalCode?: string;
    };
    metadata?: {
        mapsUri?: string;
        newReviewUri?: string;
        placeId?: string;
    };
}

export async function getGoogleLocation(
    accessToken: string,
    locationId: string
): Promise<GoogleLocationFull> {
    const normalizedId = requireGoogleLocationId(locationId, "My Business Business Information API");
    const url = `${BASE}/locations/${encodeURIComponent(normalizedId)}?readMask=${encodeURIComponent(LOCATION_READ_MASK)}`;

    const response = await fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Business Information GET ${response.status}: ${body}`);
    }

    return response.json() as Promise<GoogleLocationFull>;
}

export interface PatchListingInput {
    title?: string;
    websiteUri?: string;
    primaryPhone?: string;
    description?: string;
}

/**
 * PATCH `locations/{locationId}` with updateMask. Only whitelisted fields.
 */
export async function patchGoogleLocation(
    accessToken: string,
    locationId: string,
    input: PatchListingInput
): Promise<GoogleLocationFull> {
    const body: Record<string, unknown> = {};
    const masks: string[] = [];

    if (input.title !== undefined) {
        body.title = input.title;
        masks.push("title");
    }
    if (input.websiteUri !== undefined) {
        body.websiteUri = input.websiteUri.trim() || "";
        masks.push("websiteUri");
    }
    if (input.primaryPhone !== undefined) {
        body.phoneNumbers = { primaryPhone: input.primaryPhone.trim() || "" };
        masks.push("phoneNumbers.primaryPhone");
    }
    if (input.description !== undefined) {
        body.profile = { description: input.description };
        masks.push("profile.description");
    }

    if (masks.length === 0) {
        throw new Error("No fields to update");
    }

    const updateMask = masks.join(",");
    const normalizedId = requireGoogleLocationId(locationId, "My Business Business Information API");
    const url = `${BASE}/locations/${encodeURIComponent(normalizedId)}?updateMask=${encodeURIComponent(updateMask)}`;

    const response = await fetchWithRetry(url, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Business Information PATCH ${response.status}: ${text}`);
    }

    return response.json() as Promise<GoogleLocationFull>;
}
