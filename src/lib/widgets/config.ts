import { z } from "zod";

export const WIDGET_LAYOUTS = ["carousel", "masonry", "slider", "grid", "list", "card-badge", "compact-badge", "review-request", "bold-sticker", "reviews-button", "light-sticker", "tag-sticker", "oval-sticker", "achievement"] as const;
export const WIDGET_THEMES = ["light", "outline", "soft-tint", "deep-tint", "dark", "outline-dark"] as const;
const color = (fallback: string) => z.string().regex(/^#[0-9a-f]{6}$/i).catch(fallback);
const bounded = (min: number, max: number, fallback: number) => z.number().int().min(min).max(max).catch(fallback);
export const widgetConfigSchema = z.object({
    layout: z.enum(WIDGET_LAYOUTS).catch("carousel"),
    theme: z.enum(WIDGET_THEMES).catch("light"),
    accent: color("#197bff"), stars: color("#fbbc04"),
    title: z.string().max(100).catch("What our customers say"),
    caption: z.string().max(250).catch(""),
    source: z.enum(["google", "all"]).catch("google"),
    minRating: bounded(1, 5, 4), limit: bounded(1, 100, 20),
    sort: z.enum(["newest", "highest", "oldest"]).catch("newest"),
    exclude: z.string().max(200).catch(""), textOnly: z.boolean().catch(false),
    columns: bounded(0, 6, 0), gap: bounded(0, 40, 20), radius: bounded(0, 32, 12),
    width: bounded(280, 1600, 1280), fontSize: bounded(12, 22, 15),
    font: z.enum(["inherit", "sans-serif", "serif"]).catch("sans-serif"),
    showHeader: z.boolean().catch(true), showTitle: z.boolean().catch(true),
    showRating: z.boolean().catch(true), showCount: z.boolean().catch(true),
    showButton: z.boolean().catch(true), showAvatar: z.boolean().catch(true),
    showDate: z.boolean().catch(true), showPhotos: z.boolean().catch(false),
    showSummary: z.boolean().catch(false), showArrows: z.boolean().catch(true),
    showPagination: z.boolean().catch(true), autoplay: z.boolean().catch(false),
    floating: z.boolean().catch(false), position: z.enum(["left", "right"]).catch("right"),
    rtl: z.boolean().catch(false),
});
export type WidgetConfig = z.infer<typeof widgetConfigSchema>;
export type WidgetLayout = WidgetConfig["layout"];

export function parseWidgetConfig(value: unknown): WidgetConfig {
    if (typeof value === "string") {
        try { value = value.length <= 8000 ? JSON.parse(value) : {}; } catch { value = {}; }
    }
    return widgetConfigSchema.parse(value && typeof value === "object" && !Array.isArray(value) ? value : {});
}
export function encodeWidgetConfig(config: WidgetConfig): string {
    return JSON.stringify(parseWidgetConfig(config));
}
export function isBadgeLayout(layout: WidgetLayout): boolean {
    return !["carousel", "masonry", "slider", "grid", "list"].includes(layout);
}
