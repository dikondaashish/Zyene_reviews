/** Stored colors can bypass API validation; accept only the supported hex syntax. */
export function resolveCustomerPortalBrandColor(color?: string | null): string {
    const value = color?.trim();
    return value && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : "rgb(34,49,34)";
}

/** Compute a readable text color (white or dark) for a hex background. */
export function contrastTextForHexBackground(hex: string): string {
    const safe = resolveCustomerPortalBrandColor(hex);
    if (!safe.startsWith("#")) return "rgb(255,255,255)";
    const digits = safe.slice(1);
    const expanded = digits.length === 3 ? [...digits].map((digit) => digit + digit).join("") : digits;
    const r = parseInt(expanded.slice(0, 2), 16);
    const g = parseInt(expanded.slice(2, 4), 16);
    const b = parseInt(expanded.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? "rgb(26,26,26)" : "rgb(255,255,255)";
}
