/** Resolve a brand color: if truthy, use it; otherwise fall back to a refined dark default. */
export function resolveCustomerPortalBrandColor(color?: string | null): string {
    return color?.trim() ? color : "rgb(34,49,34)";
}

/** Compute a readable text color (white or dark) for a hex background. */
export function contrastTextForHexBackground(hex: string): string {
    if (!hex.startsWith("#")) return "rgb(255,255,255)";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? "rgb(26,26,26)" : "rgb(255,255,255)";
}
