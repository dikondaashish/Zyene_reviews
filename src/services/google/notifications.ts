import { fetchWithRetry } from "./business-profile";

/**
 * Account-level Pub/Sub notification settings MUST use the Notifications API host.
 * Using mybusinessaccountmanagement.googleapis.com for this PATCH can appear to succeed
 * without Google actually publishing review events to your topic (no Pub/Sub messages, no webhooks).
 * @see https://developers.google.com/my-business/reference/notifications/rest/v1/accounts/updateNotificationSetting
 */
const BASE_URL_NOTIFICATIONS = "https://mybusinessnotifications.googleapis.com/v1";

/** Only for location-scoped notificationSetting (if used); not the primary Pub/Sub path. */
const BASE_URL_ACCOUNT_MANAGEMENT = "https://mybusinessaccountmanagement.googleapis.com/v1";

export interface GoogleNotificationSetting {
    name: string; 
    pubsubTopic: string;
    notificationTypes: string[];
}

/**
 * Registers one or more notification settings for a Google Business Profile account or location.
 * 
 * @param accessToken Valid Google OAuth access token
 * @param accountName Resource name of the account (accounts/{accountId})
 * @param topic Full Pub/Sub topic name (projects/{project}/topics/{topic})
 */
export async function registerNotifications(
    accessToken: string,
    accountName: string,
    topic: string
): Promise<GoogleNotificationSetting> {
    // We register at the account level so all locations under this account are covered
    const url = `${BASE_URL_NOTIFICATIONS}/${accountName}/notificationSetting?updateMask=pubsubTopic,notificationTypes`;

    const body = {
        name: `${accountName}/notificationSetting`,
        pubsubTopic: topic,
        notificationTypes: [
            "NEW_REVIEW", 
            "UPDATED_REVIEW", 
            "NEW_QUESTION", 
            "UPDATED_QUESTION", 
            "NEW_ANSWER", 
            "UPDATED_ANSWER"
        ]
    };

    const response = await fetchWithRetry(url, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[Google Notifications] Registration Error (${response.status}): ${errorBody}`);
        throw new Error(`Failed to register notifications: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Patches the notification setting for a specific location.
 */
export async function patchLocationNotificationSetting(
    accessToken: string,
    accountId: string,
    locationId: string,
    topic: string
): Promise<GoogleNotificationSetting> {
    const accountName = `accounts/${accountId}`;
    const url = `${BASE_URL_ACCOUNT_MANAGEMENT}/${accountName}/locations/${locationId}/notificationSetting?updateMask=pubsubTopic,notificationTypes`;

    const body = {
        name: `${accountName}/locations/${locationId}/notificationSetting`,
        pubsubTopic: topic,
        notificationTypes: ["NEW_REVIEW", "UPDATED_REVIEW", "NEW_QUESTION", "UPDATED_QUESTION", "NEW_ANSWER", "UPDATED_ANSWER"]
    };

    const response = await fetchWithRetry(url, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[Google Notifications] Location Registration Error (${response.status}): ${errorBody}`);
        throw new Error(`Failed to register location notifications: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Fetches the current notification setting for a Google Business Profile account.
 */
export async function getNotificationSetting(
    accessToken: string,
    accountName: string
): Promise<GoogleNotificationSetting> {
    const url = `${BASE_URL_NOTIFICATIONS}/${accountName}/notificationSetting`;

    const response = await fetchWithRetry(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[Google Notifications] Get Error (${response.status}): ${errorBody}`);
        throw new Error(`Failed to get notification settings: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
