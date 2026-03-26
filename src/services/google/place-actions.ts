import { fetchWithRetry } from "./business-profile";

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
    const params = new URLSearchParams();
    params.set("pageSize", "50");
    if (pageToken) {
        params.set("pageToken", pageToken);
    }

    const url = `${BASE}/locations/${encodeURIComponent(googleLocationId)}/placeActionLinks?${params.toString()}`;

    const response = await fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`PlaceActions list ${response.status}: ${body}`);
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
    const params = new URLSearchParams();
    params.set("filter", `location=locations/${googleLocationId}`);
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
        throw new Error(`PlaceActions metadata ${response.status}: ${body}`);
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
    const url = `${BASE}/locations/${encodeURIComponent(googleLocationId)}/placeActionLinks`;

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
        throw new Error(`PlaceActions create ${response.status}: ${text}`);
    }

    return response.json() as Promise<PlaceActionLink>;
}

export async function deletePlaceActionLink(accessToken: string, linkResourceName: string): Promise<void> {
    const url = `${BASE}/${linkResourceName}`;

    const response = await fetchWithRetry(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`PlaceActions delete ${response.status}: ${text}`);
    }
}

export function linkToRow(
    link: PlaceActionLink,
    reviewPlatformId: string,
    businessId: string,
    isBroken: boolean,
    lastCheck: string | null
): {
    review_platform_id: string;
    business_id: string;
    google_link_name: string;
    place_action_type: string;
    uri: string;
    is_preferred: boolean;
    is_broken: boolean;
    last_link_check_at: string | null;
    updated_at: string;
} {
    return {
        review_platform_id: reviewPlatformId,
        business_id: businessId,
        google_link_name: link.name || "",
        place_action_type: link.placeActionType || "UNKNOWN",
        uri: link.uri || "",
        is_preferred: !!link.isPreferred,
        is_broken: isBroken,
        last_link_check_at: lastCheck,
        updated_at: new Date().toISOString(),
    };
}

/** Lightweight HEAD check; returns true if likely broken (4xx/5xx or network). */
export async function checkUriLikelyBroken(uri: string): Promise<boolean> {
    try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 8000);
        const res = await fetch(uri, {
            method: "HEAD",
            redirect: "follow",
            signal: ctrl.signal,
        });
        clearTimeout(t);
        return res.status >= 400;
    } catch {
        return true;
    }
}
