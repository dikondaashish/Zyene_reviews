import type { PlaceActionLink } from "./place-actions";

export function linkToRow(
    link: PlaceActionLink,
    reviewPlatformId: string,
    businessId: string,
    isBroken: boolean,
    lastCheck: string | null
): {
    review_platform_id: string;
    business_id: string;
    google_link_name: string;
    place_action_type: string;
    uri: string;
    is_preferred: boolean;
    is_broken: boolean;
    last_link_check_at: string | null;
    updated_at: string;
} {
    return {
        review_platform_id: reviewPlatformId,
        business_id: businessId,
        google_link_name: link.name || "",
        place_action_type: link.placeActionType || "UNKNOWN",
        uri: link.uri || "",
        is_preferred: !!link.isPreferred,
        is_broken: isBroken,
        last_link_check_at: lastCheck,
        updated_at: new Date().toISOString(),
    };
}

/** Lightweight HEAD check; returns true if likely broken (4xx/5xx or network). */
export async function checkUriLikelyBroken(uri: string): Promise<boolean> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch(uri, {
            method: "HEAD",
            redirect: "follow",
            signal: controller.signal,
        });
        return response.status >= 400;
    } catch {
        return true;
    } finally {
        clearTimeout(timeout);
    }
}
