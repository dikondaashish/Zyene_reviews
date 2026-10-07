import type { IndustryData } from "./industry-data";

/**
 * Maps a curated industry accent onto the app's design tokens so every UI
 * surface stays on the Zyene palette.
 *
 * Rules:
 * - `brand` uses the Zyene orange `--primary`. Reserve for the
 *   flagship restaurant vertical; don't use for everything or the CTA
 *   loses contrast.
 * - `chart1..chart5` reuse `--chart-1..--chart-5`, which are hand-tuned OKLCH
 *   hues for both light and dark themes. They read as industry identity
 *   without a second brand color competing with `--primary`.
 * - Everything resolves to a CSS var. Never expose raw hex to the renderer.
 */
const ACCENT_VARS: Record<IndustryData["accentColor"], string> = {
    brand: "var(--primary)",
    chart1: "var(--chart-1)",
    chart2: "var(--chart-2)",
    chart3: "var(--chart-3)",
    chart4: "var(--chart-4)",
    chart5: "var(--chart-5)",
};

const ACCENT_TINTS: Record<IndustryData["accentColor"], string> = {
    // Light tint for icon wells, eyebrow chips, subtle fills.
    // `color-mix` stays on-token and adapts automatically to dark mode.
    brand: "color-mix(in srgb, var(--primary) 12%, transparent)",
    chart1: "color-mix(in srgb, var(--chart-1) 12%, transparent)",
    chart2: "color-mix(in srgb, var(--chart-2) 12%, transparent)",
    chart3: "color-mix(in srgb, var(--chart-3) 12%, transparent)",
    chart4: "color-mix(in srgb, var(--chart-4) 12%, transparent)",
    chart5: "color-mix(in srgb, var(--chart-5) 12%, transparent)",
};

export function industryAccentVar(accent: IndustryData["accentColor"]): string {
    return ACCENT_VARS[accent];
}

export function industryAccentTint(accent: IndustryData["accentColor"]): string {
    return ACCENT_TINTS[accent];
}
