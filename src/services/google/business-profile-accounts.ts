/** Account and location listing via the Account Management + Business Information APIs. */
import {
    BASE_URL_ACCOUNT,
    BASE_URL_INFO,
    createGoogleApiError,
    fetchWithRetry,
    type GoogleAccount,
    type GoogleLocation,
} from "./business-profile-core";

/** Extended readMask for when you need full location details (address, phone, etc.) */
export const FULL_LOCATION_READ_MASK = "name,title,storeCode,metadata,storefrontAddress,phoneNumbers,categories,websiteUri,profile";

const DEFAULT_LOCATION_READ_MASK = "name,title,storeCode,metadata";

export async function listAccounts(accessToken: string): Promise<GoogleAccount[]> {
    const response = await fetchWithRetry(`${BASE_URL_ACCOUNT}/accounts`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        if (response.status === 429) {
            throw createGoogleApiError("Google API Rate Limit Exceeded", "RATE_LIMIT");
        }
        throw new Error(`Failed to list accounts: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.accounts || [];
}

export async function listLocations(accessToken: string, accountName: string, readMask?: string): Promise<GoogleLocation[]> {
    // accountName format: accounts/{accountId}
    const mask = readMask || DEFAULT_LOCATION_READ_MASK;
    const response = await fetchWithRetry(`${BASE_URL_INFO}/${accountName}/locations?readMask=${encodeURIComponent(mask)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        if (response.status === 429) {
            throw createGoogleApiError("Google API Rate Limit Exceeded", "RATE_LIMIT");
        }
        throw new Error(`Failed to list locations: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.locations || [];
}
