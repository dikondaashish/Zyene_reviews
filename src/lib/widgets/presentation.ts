import type { CSSProperties } from "react";
import type { WidgetConfig } from "@/lib/widgets/config";
import type { PublicWidgetData } from "@/lib/widgets/public-types";

export function widgetPresentation(data: PublicWidgetData, config: WidgetConfig) {
    const words = config.exclude.toLowerCase().split(",").map(w => w.trim()).filter(Boolean);
    const reviews = data.reviews.filter(r => (config.source === "all" || r.platform.toLowerCase() === "google") &&
        r.rating >= config.minRating && (!config.textOnly || !!r.content.trim()) &&
        !words.some(word => `${r.content} ${r.author_name}`.toLowerCase().includes(word)));
    reviews.sort((a, b) => config.sort === "highest" ? b.rating - a.rating :
        (config.sort === "oldest" ? 1 : -1) * a.created_at.localeCompare(b.created_at));
    return {
        reviews: reviews.slice(0, config.limit),
        count: config.source === "google" ? data.googleCount : data.reviewCount,
        rating: config.source === "google" ? data.googleRating : data.averageRating,
    };
}
export function widgetStyle(config: WidgetConfig): CSSProperties {
    const dark = ["dark", "outline-dark", "deep-tint"].includes(config.theme);
    const tint = config.theme.includes("tint");
    return {
        "--rw-accent": config.accent, "--rw-stars": config.stars,
        "--rw-bg": dark ? "#111111" : "#ffffff", "--rw-text": dark ? "#ffffff" : "#111111",
        "--rw-card": tint ? `color-mix(in srgb, ${config.accent} ${dark ? "18" : "9"}%, ${dark ? "#111111" : "#ffffff"})` : dark ? "#242424" : "#f5f5f5",
        "--rw-muted": dark ? "#b7b7b7" : "#666666", "--rw-border": dark ? "#444444" : "#dedede",
        "--rw-radius": `${config.radius}px`, "--rw-gap": `${config.gap}px`,
        "--rw-cols": config.columns || 3, "--rw-tablet-cols": Math.min(config.columns || 2, 2),
        maxWidth: config.width, fontSize: config.fontSize, fontFamily: config.font,
    } as CSSProperties;
}
