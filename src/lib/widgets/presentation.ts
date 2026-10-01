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
        "--rw-bg": config.background || (dark ? "#000000" : "#ffffff"), "--rw-text": config.textColor || (dark ? "#ffffff" : "#111111"),
        "--rw-card": config.cardColor || (tint ? `color-mix(in srgb, ${config.accent} ${dark ? "18" : "9"}%, ${dark ? "#111111" : "#ffffff"})` : dark ? "#242424" : "#f5f5f7"),
        "--rw-muted": config.mutedColor || (dark ? "#b7b7b7" : "#999999"), "--rw-border": config.borderColor || (dark ? "#444444" : "#cccccc"),
        "--rw-verified": config.verifiedColor || config.accent,
        "--rw-badge-size": `${config.badgeSize}px`, "--rw-text-lines": config.textLength === "extended" ? 8 : 4,
        "--rw-radius": `${config.radius}px`, "--rw-gap": `${config.gap}px`,
        "--rw-cols": config.columns || 3, "--rw-tablet-cols": Math.min(config.columns || 2, 2),
        maxWidth: config.width, fontSize: config.fontSize,
        fontFamily: config.font === "sans-serif" ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' : config.font,
    } as CSSProperties;
}
