import { getMarketingSiteOrigin } from "@/lib/routing/platform-routes";
import { encodeWidgetConfig, isBadgeLayout, type WidgetConfig } from "@/lib/widgets/config";

export function buildConfiguredEmbed(slug: string, config: WidgetConfig, rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zyenereviews.com") {
    const origin = getMarketingSiteOrigin(rootDomain);
    const query = new URLSearchParams({ config: encodeWidgetConfig(config) });
    const url = `${origin}/w/${encodeURIComponent(slug.trim())}?${query}`;
    const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const height = isBadgeLayout(config.layout) ? 280 : 650;
    return {
        url, height,
        code: `<script src="${escape(origin)}/widget-embed.js" data-widget-url="${escape(url)}"${config.floating && isBadgeLayout(config.layout) ? ` data-position="${config.position}"` : ""} async></script>`,
        iframe: `<iframe src="${escape(url)}" title="Customer reviews" width="100%" height="${height}" loading="lazy" style="border:0; display:block;"></iframe>`,
    };
}
