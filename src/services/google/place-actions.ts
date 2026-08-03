import { fetchWithRetry } from "./business-profile";
import { createGoogleServiceError } from "./api-error";
import { requireGoogleLocationId } from "./location-id";

const BASE = "https://mybusinessplaceactions.googleapis.com/v1";

export interface PlaceActionLink {
    name?: string;
    placeActionType?: string;
    uri?: string;
    isPreferred?: boolean;
}

export interface ListPlaceActionLinksResponse {
    placeActionLinks?: PlaceActionLink[];
    nextPageToken?: string;
}

export interface PlaceActionTypeMetadata {
    placeActionType?: string;
    displayName?: string;
}

export interface ListPlaceActionTypeMetadataResponse {
    placeActionTypeMetadata?: PlaceActionTypeMetadata[];
    nextPageToken?: string;
}

export async function listPlaceActionLinksPage(
    accessToken: string,
    googleLocationId: string,
    pageToken?: string
): Promise<ListPlaceActionLinksResponse> {
    const locationId = requireGoogleLocationId(googleLocationId, "My Business Place Actions API");

    const params = new URLSearchParams();
    params.set("pageSize", "50");
    if (pageToken) {
        params.set("pageToken", pageToken);
    }

    const url = `${BASE}/locations/${encodeURIComponent(locationId)}/placeActionLinks?${params.toString()}`;

    const response = await fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const body = await response.text();
        throw createGoogleServiceError("My Business Place Actions API", response.status, body);
    }

    return response.json() as Promise<ListPlaceActionLinksResponse>;
}

export async function listAllPlaceActionLinks(
    accessToken: string,
    googleLocationId: string
): Promise<PlaceActionLink[]> {
    const all: PlaceActionLink[] = [];
    let token: string | undefined;
    do {
        const page = await listPlaceActionLinksPage(accessToken, googleLocationId, token);
        if (page.placeActionLinks?.length) {
            all.push(...page.placeActionLinks);
        }
        token = page.nextPageToken;
    } while (token);
    return all;
}

export async function listPlaceActionTypeMetadataPage(
    accessToken: string,
    googleLocationId: string,
    pageToken?: string,
    languageCode = "en"
): Promise<ListPlaceActionTypeMetadataResponse> {
    const locationId = requireGoogleLocationId(googleLocationId, "My Business Place Actions API");

    const params = new URLSearchParams();
    params.set("filter", `location=locations/${locationId}`);
    params.set("pageSize", "50");
    params.set("languageCode", languageCode);
    if (pageToken) {
        params.set("pageToken", pageToken);
    }

    const url = `${BASE}/placeActionTypeMetadata?${params.toString()}`;

    const response = await fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const body = await response.text();
        throw createGoogleServiceError("My Business Place Actions API", response.status, body);
    }

    return response.json() as Promise<ListPlaceActionTypeMetadataResponse>;
}

export async function listAllPlaceActionTypeMetadata(
    accessToken: string,
    googleLocationId: string
): Promise<PlaceActionTypeMetadata[]> {
    const all: PlaceActionTypeMetadata[] = [];
    let token: string | undefined;
    do {
        const page = await listPlaceActionTypeMetadataPage(accessToken, googleLocationId, token);
        if (page.placeActionTypeMetadata?.length) {
            all.push(...page.placeActionTypeMetadata);
        }
        token = page.nextPageToken;
    } while (token);
    return all;
}

export async function createPlaceActionLink(
    accessToken: string,
    googleLocationId: string,
    body: { placeActionType: string; uri: string; isPreferred?: boolean }
): Promise<PlaceActionLink> {
    const locationId = requireGoogleLocationId(googleLocationId, "My Business Place Actions API");
    const url = `${BASE}/locations/${encodeURIComponent(locationId)}/placeActionLinks`;

    const response = await fetchWithRetry(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            placeActionType: body.placeActionType,
            uri: body.uri,
            isPreferred: body.isPreferred ?? false,
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw createGoogleServiceError("My Business Place Actions API", response.status, text);
    }

    return response.json() as Promise<PlaceActionLink>;
}

export async function deletePlaceActionLink(accessToken: string, linkResourceName: string): Promise<void> {
    const resourceName = linkResourceName.trim();
    if (!/^locations\/[^/?#]+\/placeActionLinks\/[^/?#]+$/.test(resourceName)) {
        throw new Error("Invalid Place Actions resource name");
    }
    const url = `${BASE}/${resourceName}`;

    const response = await fetchWithRetry(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const text = await response.text();
        throw createGoogleServiceError("My Business Place Actions API", response.status, text);
    }
}
