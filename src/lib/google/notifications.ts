import { GoogleAccount, GoogleLocation } from "./business-profile";

const BASE_URL_NOTIFICATIONS = "https://mybusinessnotifications.googleapis.com/v1";

export interface NotificationSetting {
    name: string; // accounts/{accountId}/notificationSetting
    pubsubTopic: string;
    notificationTypes: string[];
}

/**
 * Registers a Pub/Sub topic for review notifications for a specific Google Account.
 * Note: Notifications are set at the ACCOUNT level in GBP API v1, but filterable by location if needed.
 * @param accessToken Valid Google access token
 * @param accountName Format: accounts/{accountId}
 * @param topicName Format: projects/{projectId}/topics/{topicId}
 */
export async function registerNotifications(
    accessToken: string,
    accountName: string,
    topicName: string
): Promise<NotificationSetting> {
    const url = `${BASE_URL_NOTIFICATIONS}/${accountName}/notificationSetting`;

    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            pubsubTopic: topicName,
            notificationTypes: ["NEW_REVIEW", "UPDATED_REVIEW"],
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[Google Notifications] Registration failed (${response.status}): ${errorBody}`);
        throw new Error(`Failed to register notifications: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Retrieves the current notification settings for a Google Account.
 */
export async function getNotificationSettings(
    accessToken: string,
    accountName: string
): Promise<NotificationSetting> {
    const url = `${BASE_URL_NOTIFICATIONS}/${accountName}/notificationSetting`;

    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to get notification settings: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
