/**
 * Google Business Profile Local Posts API.
 *
 * Like media, local posts were never migrated off the v4
 * `mybusiness.googleapis.com` host, so v4 is the only way to read them. Uses
 * the `business.manage` scope already granted on every Google connection.
 */
import { fetchWithRetry } from "./business-profile";
import { createGoogleServiceError } from "./api-error";
import { requireGoogleLocationId } from "./location-id";

const BASE = "https://mybusiness.googleapis.com/v4";
const API_NAME = "My Business Local Posts API";

/** Google's documented maximum for this endpoint. */
const PAGE_SIZE = 100;

/**
 * Runaway guard. Audits only look back 90 days, and posts come back
 * newest-first, so 500 posts is far past anything a lookback window needs.
 */
const MAX_PAGES = 5;

/**
 * Post lifecycle states. Only LIVE and RECURRING are described by Google as
 * "currently appearing in search results" — the rest are rejected, queued, or
 * not yet due, and counting them would credit a business for posts no
 * searcher or AI engine can see.
 */
export type LocalPostState =
    | "LOCAL_POST_STATE_UNSPECIFIED"
    | "REJECTED"
    | "LIVE"
    | "PROCESSING"
    | "SCHEDULED"
    | "RECURRING";

export const PUBLISHED_POST_STATES: ReadonlySet<string> = new Set(["LIVE", "RECURRING"]);

export interface GoogleLocalPost {
    name?: string;
    languageCode?: string;
    summary?: string;
    createTime?: string;
    updateTime?: string;
    state?: LocalPostState;
    topicType?: string;
    searchUrl?: string;
}

export interface ListLocalPostsResponse {
    localPosts?: GoogleLocalPost[];
    nextPageToken?: string;
}

export async function listLocalPostsPage(
    accessToken: string,
    accountId: string,
    googleLocationId: string,
    pageToken?: string
): Promise<ListLocalPostsResponse> {
    const locationId = requireGoogleLocationId(googleLocationId, API_NAME);

    const params = new URLSearchParams();
    params.set("pageSize", String(PAGE_SIZE));
    if (pageToken) params.set("pageToken", pageToken);

    const url = `${BASE}/accounts/${encodeURIComponent(accountId)}/locations/${encodeURIComponent(
        locationId
    )}/localPosts?${params.toString()}`;

    const response = await fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const body = await response.text();
        throw createGoogleServiceError(API_NAME, response.status, body);
    }

    return response.json() as Promise<ListLocalPostsResponse>;
}

export async function listAllLocalPosts(
    accessToken: string,
    accountId: string,
    googleLocationId: string
): Promise<GoogleLocalPost[]> {
    const all: GoogleLocalPost[] = [];
    let token: string | undefined;
    let pages = 0;

    do {
        const page = await listLocalPostsPage(accessToken, accountId, googleLocationId, token);
        if (page.localPosts?.length) all.push(...page.localPosts);
        token = page.nextPageToken;
        pages += 1;
    } while (token && pages < MAX_PAGES);

    return all;
}
