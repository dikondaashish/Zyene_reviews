import { fetchWithRetry } from "./business-profile";

const BASE = "https://mybusinessaccountmanagement.googleapis.com/v1";

export interface GoogleAccountAdmin {
    name?: string;
    admin?: string;
    role?: string;
    pendingInvitation?: boolean;
}

export interface ListAccountAdminsResponse {
    accountAdmins?: GoogleAccountAdmin[];
}

function normalizeParent(prefix: "accounts" | "locations", resourceName: string): string {
    return resourceName.startsWith(`${prefix}/`) ? resourceName : `${prefix}/${resourceName}`;
}

/**
 * GET accounts/{accountId}/admins — who has access to the Google Business account.
 * `accountResourceName` must be `accounts/{numericId}`.
 */
export async function listAccountAdmins(
    accessToken: string,
    accountResourceName: string
): Promise<GoogleAccountAdmin[]> {
    const parent = normalizeParent("accounts", accountResourceName);
    const url = `${BASE}/${parent}/admins`;
    const response = await fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Account admins list ${response.status}: ${body}`);
    }

    const data = (await response.json()) as ListAccountAdminsResponse;
    return data.accountAdmins || [];
}

/**
 * GET locations/{locationId}/admins — who has access to a specific Business Profile location.
 * `locationResourceName` must be `locations/{numericId}`.
 */
export async function listLocationAdmins(
    accessToken: string,
    locationResourceName: string
): Promise<GoogleAccountAdmin[]> {
    const parent = normalizeParent("locations", locationResourceName);
    const url = `${BASE}/${parent}/admins`;

    const response = await fetchWithRetry(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Account admins list ${response.status}: ${body}`);
    }

    const data = (await response.json()) as ListAccountAdminsResponse;
    return data.accountAdmins || [];
}
