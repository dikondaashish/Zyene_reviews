/**
 * Google Business Profile Media API (photos/videos on a location).
 *
 * Still on the v4 `mybusiness.googleapis.com` host: media has no equivalent in
 * the v1 Business Information / Account Management split, so v4 remains the
 * only way to read it. Same host the reviews client already uses
 * (`BASE_URL_REVIEWS`), and the same `business.manage` scope — this adds no new
 * consent surface.
 *
 * v4 addresses locations as `accounts/{accountId}/locations/{locationId}`, so
 * callers must supply the account id. The v1 clients in this directory take a
 * location id alone; that difference is the API's, not ours.
 */
import { fetchWithRetry } from "./business-profile";
import { createGoogleServiceError } from "./api-error";
import { requireGoogleLocationId } from "./location-id";

const BASE = "https://mybusiness.googleapis.com/v4";
const API_NAME = "My Business Media API";

/** Google's documented maximum for this endpoint. */
const PAGE_SIZE = 2500;

/**
 * Stop after this many pages. A local business has tens of photos, not tens of
 * thousands, so this is a runaway guard rather than a real limit. When it trips
 * we report `truncated` instead of silently returning a partial count as total.
 */
const MAX_PAGES = 4;

export interface GoogleMediaItem {
    name?: string;
    mediaFormat?: "MEDIA_FORMAT_UNSPECIFIED" | "PHOTO" | "VIDEO";
    locationAssociation?: { category?: string; priceListItemId?: string };
    createTime?: string;
    /** Present only on customer-contributed media. Owner uploads have no attribution. */
    attribution?: { profileName?: string; profileUrl?: string };
}

export interface ListMediaResponse {
    mediaItems?: GoogleMediaItem[];
    totalMediaItemCount?: number;
    nextPageToken?: string;
}

export async function listMediaPage(
    accessToken: string,
    accountId: string,
    googleLocationId: string,
    pageToken?: string
): Promise<ListMediaResponse> {
    const locationId = requireGoogleLocationId(googleLocationId, API_NAME);

    const params = new URLSearchParams();
    params.set("pageSize", String(PAGE_SIZE));
    if (pageToken) params.set("pageToken", pageToken);

    const url = `${BASE}/accounts/${encodeURIComponent(accountId)}/locations/${encodeURIComponent(
        locationId
    )}/media?${params.toString()}`;

    const response = await fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const body = await response.text();
        throw createGoogleServiceError(API_NAME, response.status, body);
    }

    return response.json() as Promise<ListMediaResponse>;
}

export interface LocationMedia {
    items: GoogleMediaItem[];
    /**
     * Google's own count for the location, independent of pagination. Preferred
     * over `items.length` for totals, since it stays correct under truncation.
     */
    totalMediaItemCount: number;
    /** True when MAX_PAGES stopped us before Google ran out of pages. */
    truncated: boolean;
}

export async function listAllMedia(
    accessToken: string,
    accountId: string,
    googleLocationId: string
): Promise<LocationMedia> {
    const items: GoogleMediaItem[] = [];
    let total = 0;
    let token: string | undefined;
    let pages = 0;

    do {
        const page = await listMediaPage(accessToken, accountId, googleLocationId, token);
        if (page.mediaItems?.length) items.push(...page.mediaItems);
        // Reported per page; the last value seen is as authoritative as any.
        if (typeof page.totalMediaItemCount === "number") total = page.totalMediaItemCount;
        token = page.nextPageToken;
        pages += 1;
    } while (token && pages < MAX_PAGES);

    return {
        items,
        totalMediaItemCount: total || items.length,
        truncated: Boolean(token),
    };
}
