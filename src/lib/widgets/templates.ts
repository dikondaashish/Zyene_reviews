import type { WidgetConfig } from "@/lib/widgets/config";
import { WIDGET_COLORS } from "@/lib/widgets/palette";

type Template = { id: string; name: string; config: Partial<WidgetConfig> };
const templates: Template[] = [
    { id: "carousel", name: "Carousel Widget", config: { layout: "carousel" } },
    { id: "badge", name: "Badge", config: { layout: "card-badge" } },
    { id: "grid-summary", name: "Grid with AI Summary", config: { layout: "grid", headerStyle: "reviews-count", showSummary: true } },
    { id: "simple", name: "Simple Carousel", config: { layout: "carousel", theme: "outline", sourceStyle: "inline", showHeader: false, showTitle: false } },
    { id: "slider", name: "Slider", config: { layout: "slider", showHeader: false } },
    { id: "floating", name: "Floating Badge", config: { layout: "card-badge", floating: true } },
    { id: "carousel-summary", name: "Carousel with AI Summary", config: { layout: "carousel", theme: "outline", headerStyle: "rating", showTitle: false, showSummary: true } },
    { id: "photos", name: "Carousel with Photos", config: { layout: "carousel", showTitle: false, headerStyle: "centered" } },
    { id: "light-sticker", name: "Light Sticker", config: { layout: "light-sticker" } },
    { id: "tag-sticker", name: "Tag Sticker", config: { layout: "tag-sticker", floating: true, badgeLabel: "excellent" } },
    { id: "achievement", name: "Achievement Sticker", config: { layout: "achievement", badgeLabel: "excellent" } },
    { id: "floating-achievement", name: "Floating Achievement", config: { layout: "achievement", floating: true } },
    { id: "dark-carousel", name: "Dark Carousel", config: { layout: "carousel", theme: "dark", background: WIDGET_COLORS.darkBackground, reviewStyle: "bubble", showHeader: false } },
    { id: "list", name: "List", config: { layout: "list", width: 680, showTitle: false, headerStyle: "rating", showSummary: true } },
    { id: "wall", name: "Review Wall", config: { layout: "masonry", showTitle: false, headerStyle: "wall", showSummary: true, textLength: "extended", accent: WIDGET_COLORS.wallAccent } },
    { id: "dark-grid", name: "Dark Grid with AI Summary", config: { layout: "grid", theme: "dark", background: WIDGET_COLORS.darkBackground, headerStyle: "rating", reviewStyle: "bubble", showSummary: true } },
    { id: "sidebar", name: "Sidebar Widget", config: { layout: "carousel", width: 340, columns: 1, theme: "outline", showTitle: false, showButton: false, showPagination: false } },
    { id: "dark-floating", name: "Dark Floating Badge", config: { layout: "card-badge", theme: "dark", floating: true } },
    { id: "halloween", name: "Halloween Google Reviews", config: { layout: "carousel", theme: "dark", background: WIDGET_COLORS.darkBackground, accent: WIDGET_COLORS.halloweenAccent, showVerified: false } },
    { id: "halloween-badge", name: "Halloween Google Reviews Badge", config: { layout: "card-badge", theme: "dark", accent: WIDGET_COLORS.halloweenAccent, badgeLabel: "excellent" } },
];
export const WIDGET_TEMPLATES = templates.map(template => ({ ...template, config: { ...template.config, preset: template.id } }));
export const LAYOUT_LABELS = {
    carousel: "Carousel", masonry: "Masonry", slider: "Slider", grid: "Grid", list: "List",
    "card-badge": "Card Badge", "compact-badge": "Compact Badge", "review-request": "Review Request",
    "bold-sticker": "Bold Sticker", "reviews-button": "Reviews Button", "light-sticker": "Light Sticker",
    "tag-sticker": "Tag Sticker", "oval-sticker": "Oval Sticker", achievement: "Achievement",
};
