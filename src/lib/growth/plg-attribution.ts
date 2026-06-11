// ─────────────────────────────────────────────────────────────────────────────
// Product-led growth attribution — Phase 7
// ─────────────────────────────────────────────────────────────────────────────

import { plgEmailFooterHtml as buildPlgEmailFooterHtml } from "@/lib/email/transactional-email-styles";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";

export type PlgRefSource = "review-page" | "widget" | "review-request";

/** Signup URL with PLG UTM + ref for measuring widget / review-page / SMS-email loops. */
export function buildPlgMarketingUrl(source: PlgRefSource): string {
    const url = new URL(MARKETING_SITE_ORIGIN);
    url.searchParams.set("utm_source", "plg");
    url.searchParams.set("utm_medium", source);
    url.searchParams.set("utm_campaign", "product_loop");
    url.searchParams.set("ref", source);
    return url.toString();
}

export const PLG_FOOTER_LABEL = "Zyene Reviews";

export function plgSmsFooter(): string {
    return `\n\nReview management powered by Zyene Reviews — ${buildPlgMarketingUrl("review-request")}`;
}

export function plgEmailFooterHtml(): string {
    const href = buildPlgMarketingUrl("review-request");
    return buildPlgEmailFooterHtml(href);
}

export function plgEmailFooterPlain(): string {
    return `\n\nReview management powered by Zyene Reviews — ${buildPlgMarketingUrl("review-request")}`;
}
