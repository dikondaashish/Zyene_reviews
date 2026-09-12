/** WCAG relative luminance for validated three- or six-digit sRGB hex colors. */
function luminance(color: string): number {
    const hex = color.slice(1);
    const expanded = hex.length === 3 ? [...hex].map(c => c + c).join("") : hex;
    const channels = [0, 2, 4].map(i => {
        const value = parseInt(expanded.slice(i, i + 2), 16) / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function contrastRatio(first: string, second: string): number {
    const [dark, light] = [luminance(first), luminance(second)].sort((a, b) => a - b);
    return (light + 0.05) / (dark + 0.05);
}

/** Black or white guarantees at least 4.5:1 for any opaque sRGB background. */
export function readableForeground(background: string): string {
    if (!/^#([\da-f]{3}|[\da-f]{6})$/i.test(background)) return "var(--primary-foreground)";
    return contrastRatio(background, "#ffffff") >= contrastRatio(background, "#000000") ? "#ffffff" : "#000000";
}
