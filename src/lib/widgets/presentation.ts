import type { CSSProperties } from "react";
import type { WidgetConfig } from "@/lib/widgets/config";
import type { PublicWidgetData } from "@/lib/widgets/public-types";
import { WIDGET_COLORS } from "@/lib/widgets/palette";

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
        "--rw-bg": config.background || (dark ? WIDGET_COLORS.darkBackground : WIDGET_COLORS.lightBackground), "--rw-text": config.textColor || (dark ? WIDGET_COLORS.darkText : WIDGET_COLORS.lightText),
        "--rw-card": config.cardColor || (tint ? `color-mix(in srgb, ${config.accent} ${dark ? "18" : "9"}%, ${dark ? WIDGET_COLORS.lightText : WIDGET_COLORS.lightBackground})` : dark ? WIDGET_COLORS.darkCard : WIDGET_COLORS.lightCard),
        "--rw-muted": config.mutedColor || (dark ? WIDGET_COLORS.darkMuted : WIDGET_COLORS.lightMuted), "--rw-border": config.borderColor || (dark ? WIDGET_COLORS.darkBorder : WIDGET_COLORS.lightBorder),
        "--rw-verified": config.verifiedColor || config.accent,
        "--rw-badge-size": `${config.badgeSize}px`, "--rw-text-lines": config.textLength === "extended" ? 8 : 4,
        "--rw-radius": `${config.radius}px`, "--rw-gap": `${config.gap}px`,
        "--rw-cols": config.columns || 3, "--rw-tablet-cols": Math.min(config.columns || 2, 2),
        maxWidth: config.width, fontSize: config.fontSize,
        fontFamily: config.font === "sans-serif" ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' : config.font,
    } as CSSProperties;
}
