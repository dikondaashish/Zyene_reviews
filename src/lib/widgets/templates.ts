import type { WidgetConfig } from "@/lib/widgets/config";

type Template = { id: string; name: string; config: Partial<WidgetConfig> };
export const WIDGET_TEMPLATES: Template[] = [
    { id: "carousel", name: "Carousel Widget", config: { layout: "carousel" } },
    { id: "badge", name: "Badge", config: { layout: "card-badge" } },
    { id: "grid-summary", name: "Grid with AI Highlights", config: { layout: "grid", showSummary: true } },
    { id: "simple", name: "Simple Carousel", config: { layout: "carousel", showHeader: false, showTitle: false } },
    { id: "slider", name: "Slider", config: { layout: "slider", showHeader: false } },
    { id: "floating", name: "Floating Badge", config: { layout: "compact-badge", floating: true } },
    { id: "carousel-summary", name: "Carousel with AI Highlights", config: { layout: "carousel", showSummary: true } },
    { id: "photos", name: "Carousel with Photos", config: { layout: "carousel", showPhotos: true } },
    { id: "light-sticker", name: "Light Sticker", config: { layout: "light-sticker" } },
    { id: "tag-sticker", name: "Tag Sticker", config: { layout: "tag-sticker" } },
    { id: "achievement", name: "Achievement Sticker", config: { layout: "achievement" } },
    { id: "floating-achievement", name: "Floating Achievement", config: { layout: "achievement", floating: true } },
    { id: "dark-carousel", name: "Dark Carousel", config: { layout: "carousel", theme: "dark" } },
    { id: "list", name: "List", config: { layout: "list" } },
    { id: "wall", name: "Review Wall", config: { layout: "masonry", showHeader: false } },
    { id: "dark-grid", name: "Dark Grid with AI Highlights", config: { layout: "grid", theme: "dark", showSummary: true } },
    { id: "sidebar", name: "Sidebar Widget", config: { layout: "list", width: 320, columns: 1 } },
    { id: "dark-floating", name: "Dark Floating Badge", config: { layout: "compact-badge", theme: "dark", floating: true } },
    { id: "halloween", name: "Halloween Google Reviews", config: { layout: "carousel", theme: "deep-tint", accent: "#f58220", stars: "#f58220" } },
    { id: "halloween-badge", name: "Halloween Google Reviews Badge", config: { layout: "card-badge", theme: "deep-tint", accent: "#f58220", stars: "#f58220" } },
];
export const LAYOUT_LABELS = {
    carousel: "Carousel", masonry: "Masonry", slider: "Slider", grid: "Grid", list: "List",
    "card-badge": "Card Badge", "compact-badge": "Compact Badge", "review-request": "Review Request",
    "bold-sticker": "Bold Sticker", "reviews-button": "Reviews Button", "light-sticker": "Light Sticker",
    "tag-sticker": "Tag Sticker", "oval-sticker": "Oval Sticker", achievement: "Achievement",
};
