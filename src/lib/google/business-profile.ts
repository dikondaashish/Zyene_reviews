
export interface GoogleTokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
}

export interface GoogleAccount {
    name: string; // accounts/{accountId}
    accountName: string;
    type: string;
    verificationState: string;
    vettedState: string;
}

export interface GoogleLocation {
    name: string; // locations/{locationId} or accounts/{accountId}/locations/{locationId}
    title: string;
    storeCode?: string;
}

export interface GoogleReview {
    reviewId: string;
    reviewer: {
        displayName: string;
        profilePhotoUrl?: string;
    };
    starRating: string; // "FIVE", "FOUR", etc.
    comment?: string;
    createTime: string;
    updateTime: string;
    reviewReply?: {
        comment: string;
        updateTime: string;
    };
}

const BASE_URL_ACCOUNT = "https://mybusinessaccountmanagement.googleapis.com/v1";
const BASE_URL_INFO = "https://mybusinessbusinessinformation.googleapis.com/v1";
const BASE_URL_REVIEWS = "https://mybusiness.googleapis.com/v4";

export async function refreshGoogleToken(refreshToken: string): Promise<GoogleTokenResponse> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    return response.json();
}

export async function listAccounts(accessToken: string): Promise<GoogleAccount[]> {
    const response = await fetch(`${BASE_URL_ACCOUNT}/accounts`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        // Handle edge case where user has NO accounts but API returns 200 with empty list?
        // Or 404?
        // Just throw for now to debug.
        throw new Error(`Failed to list accounts: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.accounts || [];
}

export async function listLocations(accessToken: string, accountName: string): Promise<GoogleLocation[]> {
    // accountName format: accounts/{accountId}
    const response = await fetch(`${BASE_URL_INFO}/${accountName}/locations?readMask=name,title,storeCode`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        throw new Error(`Failed to list locations: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.locations || [];
}

export async function listReviews(accessToken: string, accountId: string, locationId: string): Promise<GoogleReview[]> {
    // URL: https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews
    // Note: accountId and locationId are raw IDs, not "accounts/{id}"
    // But listLocations returns "locations/{locationId}" or "accounts/{accountId}/locations/{locationId}"?
    // We need to parse.
    // Actually, v4 API takes `accounts/{accountId}/locations/{locationId}/reviews` as PATH.
    // Let's verify format.

    const url = `${BASE_URL_REVIEWS}/accounts/${accountId}/locations/${locationId}/reviews`;

    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        throw new Error(`Failed to list reviews: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.reviews || [];
}

export async function replyToReview(
    accessToken: string,
    accountId: string,
    locationId: string,
    reviewId: string,
    text: string
): Promise<void> {
    const url = `${BASE_URL_REVIEWS}/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`;

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: text }),
    });

    if (!response.ok) {
        throw new Error(`Failed to reply to review: ${response.status} ${response.statusText}`);
    }
}
