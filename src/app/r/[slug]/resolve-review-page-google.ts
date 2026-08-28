/**
 * Public /r/[slug] pages need a Google write-review destination.
 * That can come from OAuth (`review_platforms`), a URL the owner saved
 * manually (`google_review_url`), or a Maps search built from the listing
 * name and address when the account was set up without Google OAuth.
 */

function usableHttpUrl(value: string | null | undefined): string | undefined {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    if (!/^https?:\/\//i.test(trimmed)) return undefined;
    return trimmed;
}

export function googleMapsSearchUrl(
    name: string | null | undefined,
    addressParts: Array<string | null | undefined>
): string | undefined {
    const namePart = typeof name === "string" ? name.trim() : "";
    const address = addressParts
        .map((part) => (typeof part === "string" ? part.trim() : ""))
        .filter(Boolean)
        .join(", ");
    const query = [namePart, address].filter(Boolean).join(" ");
    if (!query) return undefined;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function resolveReviewPageGoogle(input: {
    googleReviewUrl: string | null | undefined;
    platform: { external_url?: string | null } | null | undefined;
    mapsFallbackUrl?: string | null;
}): { connected: boolean; googleUrl: string | undefined } {
    const googleUrl =
        usableHttpUrl(input.googleReviewUrl) ??
        usableHttpUrl(input.platform?.external_url) ??
        usableHttpUrl(input.mapsFallbackUrl);

    return {
        connected: Boolean(googleUrl || input.platform),
        googleUrl,
    };
}
