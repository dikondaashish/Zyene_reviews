import { z } from "zod";

export const WIDGET_LAYOUTS = ["carousel", "masonry", "slider", "grid", "list", "card-badge", "compact-badge", "review-request", "bold-sticker", "reviews-button", "light-sticker", "tag-sticker", "oval-sticker", "achievement"] as const;
export const WIDGET_THEMES = ["light", "outline", "soft-tint", "deep-tint", "dark", "outline-dark"] as const;
const color = (fallback: string) => z.string().regex(/^#[0-9a-f]{6}$/i).catch(fallback);
const bounded = (min: number, max: number, fallback: number) => z.number().int().min(min).max(max).catch(fallback);
export const widgetConfigSchema = z.object({
    layout: z.enum(WIDGET_LAYOUTS).catch("carousel"),
    theme: z.enum(WIDGET_THEMES).catch("light"),
    accent: color("#3366ff"), stars: color("#fbbc04"),
    preset: z.string().max(40).regex(/^[a-z-]+$/).catch("carousel"),
    title: z.string().max(100).catch("What Our Customers Say"),
    caption: z.string().max(250).catch(""),
    source: z.enum(["google", "all"]).catch("google"),
    minRating: bounded(1, 5, 1), limit: bounded(1, 100, 20),
    sort: z.enum(["newest", "highest", "oldest"]).catch("newest"),
    exclude: z.string().max(200).catch(""), textOnly: z.boolean().catch(false),
    columns: bounded(0, 6, 0), gap: bounded(0, 40, 20), radius: bounded(0, 32, 12),
    width: bounded(280, 1600, 1280), fontSize: bounded(12, 22, 16),
    font: z.enum(["inherit", "sans-serif", "serif"]).catch("sans-serif"),
    showHeader: z.boolean().catch(true), showTitle: z.boolean().catch(true),
    showRating: z.boolean().catch(true), showCount: z.boolean().catch(true),
    showButton: z.boolean().catch(true), showAvatar: z.boolean().catch(true),
    showDate: z.boolean().catch(true), showPhotos: z.boolean().catch(true),
    showName: z.boolean().catch(true), showVerified: z.boolean().catch(true),
    showSource: z.boolean().catch(true), showReviewRating: z.boolean().catch(true),
    showReply: z.boolean().catch(false), showGoogleIcon: z.boolean().catch(true),
    reviewStyle: z.enum(["classic", "bubble"]).catch("classic"),
    sourceStyle: z.enum(["avatar", "inline", "right"]).catch("avatar"),
    headerStyle: z.enum(["google-reviews", "rating", "reviews-count", "centered", "wall"]).catch("google-reviews"),
    textMode: z.enum(["short", "full"]).catch("short"),
    textLength: z.enum(["brief", "extended"]).catch("brief"),
    badgeLabel: z.enum(["none", "excellent", "google-rating"]).catch("none"),
    badgeSize: bounded(80, 240, 100), badgeAlign: z.enum(["left", "center", "right"]).catch("center"),
    clickAction: z.enum(["popup", "google", "none"]).catch("popup"),
    rows: bounded(1, 6, 1), mobileRows: bounded(1, 3, 1),
    scrollMode: z.enum(["item", "page"]).catch("item"),
    animationDuration: bounded(150, 1500, 300), autoplayDelay: bounded(2, 20, 5),
    swipe: z.boolean().catch(true),
    background: color("#ffffff").optional(), cardColor: color("#f5f5f7").optional(),
    textColor: color("#111111").optional(), mutedColor: color("#999999").optional(),
    borderColor: color("#cccccc").optional(), verifiedColor: color("#3366ff").optional(),
    showSummary: z.boolean().catch(false), showArrows: z.boolean().catch(true),
    showPagination: z.boolean().catch(true), autoplay: z.boolean().catch(false),
    floating: z.boolean().catch(false), position: z.enum(["left", "right"]).catch("left"),
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
