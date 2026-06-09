import type { BusinessContextReviewPlatform } from "@/types/business-context";

export type GoogleConnectionStatus = "connected" | "not_connected" | "needs_reconnect";

export function getGoogleConnectionStatus(
    reviewPlatforms?: BusinessContextReviewPlatform[] | null
): GoogleConnectionStatus {
    const google = reviewPlatforms?.find((p) => p.platform === "google");
    if (!google) return "not_connected";

    const locationId = google.google_location_id;
    const hasLocation = typeof locationId === "string" && locationId.trim().length > 0;

    const status = String(google.sync_status ?? "").toLowerCase();
    if (status === "error_no_refresh_token" || status === "error_token_revoked") {
        return "needs_reconnect";
    }
    if (!hasLocation) return "not_connected";
    if (status.startsWith("error_")) return "needs_reconnect";
    return "connected";
}

export function isGoogleBusinessConnected(
    reviewPlatforms?: BusinessContextReviewPlatform[] | null
): boolean {
    return getGoogleConnectionStatus(reviewPlatforms) === "connected";
}
