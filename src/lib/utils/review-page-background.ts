/** Build a subtle diagonal gradient from a single brand hex (public /r/[slug] backdrop). */

/** Default accent hex for buttons/links on the public review page when none is set in DB. */
export const DEFAULT_BRAND_COLOR_HEX = "#0f172a";

/** Default “seed” color for orbs and new businesses (royal blue, top-right in reference UI). */
export const DEFAULT_REVIEW_PAGE_BACKGROUND_HEX = "#1a2b5a";

/**
 * Full-page default backdrop (navy bottom-left → blue top-right), matching product reference.
 * Used when no custom color is set and for legacy DB default #0f172a.
 */
export const DEFAULT_REVIEW_PAGE_BACKDROP_CSS =
    "linear-gradient(135deg, #1a2b5a 0%, #0e1a3d 46%, #050a1b 100%)";

function normalizeHexKey(hex: string) {
    return hex.replace(/^#/, "").toLowerCase();
}

function parseHexRgb(hex: string): { r: number; g: number; b: number } | null {
    const raw = hex.replace(/^#/, "").trim();
    if (raw.length === 3) {
        return {
            r: parseInt(raw[0] + raw[0], 16),
            g: parseInt(raw[1] + raw[1], 16),
            b: parseInt(raw[2] + raw[2], 16),
        };
    }
    if (raw.length === 6) {
        return {
            r: parseInt(raw.slice(0, 2), 16),
            g: parseInt(raw.slice(2, 4), 16),
            b: parseInt(raw.slice(4, 6), 16),
        };
    }
    return null;
}

function mixTowardBlack(rgb: { r: number; g: number; b: number }, t: number) {
    return {
        r: rgb.r * (1 - t),
        g: rgb.g * (1 - t),
        b: rgb.b * (1 - t),
    };
}

function toHex(rgb: { r: number; g: number; b: number }) {
    const c = (n: number) =>
        Math.max(0, Math.min(255, Math.round(n)))
            .toString(16)
            .padStart(2, "0");
    return `#${c(rgb.r)}${c(rgb.g)}${c(rgb.b)}`;
}

export function reviewPageBackdropGradient(baseHex: string): string {
    const key = normalizeHexKey(baseHex);
    if (key === "1a2b5a" || key === "0f172a") {
        return DEFAULT_REVIEW_PAGE_BACKDROP_CSS;
    }

    const rgb = parseHexRgb(baseHex);
    if (!rgb) {
        return DEFAULT_REVIEW_PAGE_BACKDROP_CSS;
    }
    const mid = mixTowardBlack(rgb, 0.35);
    const end = mixTowardBlack(rgb, 0.72);
    return `linear-gradient(135deg, ${toHex(rgb)} 0%, ${toHex(mid)} 46%, ${toHex(end)} 100%)`;
}

/** Hex to use for glow orbs (matches gradient hue even when DB still has legacy default). */
export function reviewPageOrbBaseHex(baseHex: string): string {
    const k = normalizeHexKey(baseHex);
    if (k === "0f172a" || k === "1a2b5a") return DEFAULT_REVIEW_PAGE_BACKGROUND_HEX;
    if (!parseHexRgb(baseHex)) return DEFAULT_REVIEW_PAGE_BACKGROUND_HEX;
    return baseHex;
}

export function reviewPageOrbRgba(baseHex: string, alpha: number): string {
    const rgb = parseHexRgb(reviewPageOrbBaseHex(baseHex));
    if (!rgb) return `rgba(26, 43, 90, ${alpha})`;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
