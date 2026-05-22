// ─────────────────────────────────────────────────────────────────────────────
// Cal.com inline embed for /demo — Phase 8
// https://cal.com/docs/developing/guides/embeds
// ─────────────────────────────────────────────────────────────────────────────

/** Production booking link — override with NEXT_PUBLIC_CAL_COM_EMBED_URL if needed. */
export const DEFAULT_CAL_COM_BOOKING_URL =
    "https://cal.com/zyene/30-min-meeting?overlayCalendar=true";

/** Reads Cal.com booking URL from env (supports legacy CALENDLY var name). */
export function getCalComEmbedUrlFromEnv(): string | null {
    const raw =
        process.env.NEXT_PUBLIC_CAL_COM_EMBED_URL?.trim() ||
        process.env.NEXT_PUBLIC_CALENDLY_EMBED_URL?.trim() ||
        DEFAULT_CAL_COM_BOOKING_URL;
    return normalizeCalComEmbedUrl(raw);
}

/**
 * Ensures ?embed=true for Cal.com iframe embeds.
 * Example: https://cal.com/team/zyene/enterprise-demo → same with embed=true
 */
export function normalizeCalComEmbedUrl(raw: string | null | undefined): string | null {
    if (!raw?.trim()) return null;
    try {
        const url = new URL(raw.trim());
        if (!url.searchParams.has("embed")) {
            url.searchParams.set("embed", "true");
        }
        return url.toString();
    } catch {
        return null;
    }
}
