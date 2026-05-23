/** Extract `locations/{id}` segment tail from a full resource name. */
export function googleLocationIdFromLocationField(location: string): string | null {
    const parts = location.split("/").filter(Boolean);
    const idx = parts.lastIndexOf("locations");
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    return null;
}

export type PubSubPushBody = {
    message?: {
        data?: string;
        messageId?: string;
        publishTime?: string;
    };
    subscription?: string;
};

export function parseReviewLocationFromPayload(payload: Record<string, unknown>): {
    kind: "review";
    googleLocationId: string;
    notificationLabel: string;
} | { kind: "skip"; reason: string } {
    const t = payload.type;
    if (t === "NEW_REVIEW" || t === "UPDATED_REVIEW") {
        const loc = payload.location;
        if (typeof loc !== "string" || !loc.trim()) {
            return { kind: "skip", reason: "review_missing_location" };
        }
        const googleLocationId = googleLocationIdFromLocationField(loc);
        if (!googleLocationId) {
            return { kind: "skip", reason: "review_location_unparseable" };
        }
        return { kind: "review", googleLocationId, notificationLabel: String(t) };
    }

    const nr = payload.new_review;
    if (nr && typeof nr === "object") {
        const locationName = (nr as { locationName?: unknown }).locationName;
        if (typeof locationName !== "string" || !locationName.trim()) {
            return { kind: "skip", reason: "new_review_missing_locationName" };
        }
        const googleLocationId = googleLocationIdFromLocationField(locationName);
        if (!googleLocationId) {
            return { kind: "skip", reason: "new_review_location_unparseable" };
        }
        return { kind: "review", googleLocationId, notificationLabel: "new_review" };
    }

    const ur = payload.updated_review;
    if (ur && typeof ur === "object") {
        const locationName = (ur as { locationName?: unknown }).locationName;
        if (typeof locationName !== "string" || !locationName.trim()) {
            return { kind: "skip", reason: "updated_review_missing_locationName" };
        }
        const googleLocationId = googleLocationIdFromLocationField(locationName);
        if (!googleLocationId) {
            return { kind: "skip", reason: "updated_review_location_unparseable" };
        }
        return { kind: "review", googleLocationId, notificationLabel: "updated_review" };
    }

    return { kind: "skip", reason: "not_review_notification" };
}
