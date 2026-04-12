/** Build a subtle diagonal gradient from a single brand hex (public /r/[slug] backdrop). */

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
    const rgb = parseHexRgb(baseHex);
    if (!rgb) {
        return "linear-gradient(135deg, #0f172a 0%, #172554 50%, #1e1b4b 100%)";
    }
    const mid = mixTowardBlack(rgb, 0.32);
    const end = mixTowardBlack(rgb, 0.52);
    return `linear-gradient(135deg, ${toHex(rgb)} 0%, ${toHex(mid)} 52%, ${toHex(end)} 100%)`;
}

export function reviewPageOrbRgba(baseHex: string, alpha: number): string {
    const rgb = parseHexRgb(baseHex);
    if (!rgb) return `rgba(59, 130, 246, ${alpha})`;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
