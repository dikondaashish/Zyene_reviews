import type { PlaceActionLink } from "@/services/google/place-actions";
import { fetchPublicHttpBytes } from "@/services/aeo/crawler/public-http";

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
    const deadline = Date.now() + 8000;
    const visited = new Set<string>();
    try {
        let url = new URL(uri);
        for (let redirects = 0; redirects <= 3; redirects++) {
            const remaining = deadline - Date.now();
            if (remaining <= 0 || visited.has(url.href)) return true;
            visited.add(url.href);
            // Reuse connection-time DNS validation for every destination/hop.
            const response = await fetchPublicHttpBytes(url.href, {
                method: "HEAD", redirect: "manual", timeoutMs: remaining, maxBytes: 0,
            });
            if (![301, 302, 303, 307, 308].includes(response.status)) return response.status >= 400;
            if (!response.location) return true;
            url = new URL(response.location, url);
        }
        return true;
    } catch {
        return true;
    }
}
