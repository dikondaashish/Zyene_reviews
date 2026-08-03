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

export interface GoogleLocationFull {
    name?: string;
    title?: string;
    websiteUri?: string;
    phoneNumbers?: GoogleLocationPhoneNumbers;
    profile?: GoogleLocationProfile;
    regularHours?: GoogleLocationRegularHours;
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
