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

/**
 * GET accounts/{accountId}/admins — who has access to the Google Business account.
 * `accountResourceName` must be `accounts/{numericId}`.
 */
export async function listAccountAdmins(
    accessToken: string,
    accountResourceName: string
): Promise<GoogleAccountAdmin[]> {
    const parent = accountResourceName.startsWith("accounts/")
        ? accountResourceName
        : `accounts/${accountResourceName}`;

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
