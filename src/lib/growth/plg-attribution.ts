// ─────────────────────────────────────────────────────────────────────────────
// Product-led growth attribution — Phase 7
// ─────────────────────────────────────────────────────────────────────────────

export type PlgRefSource = "review-page" | "widget" | "review-request";

const MARKETING_ORIGIN = "https://zyenereviews.com";

/** Signup URL with PLG UTM + ref for measuring widget / review-page / SMS-email loops. */
export function buildPlgMarketingUrl(source: PlgRefSource): string {
    const url = new URL(MARKETING_ORIGIN);
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
    return `<p style="margin:24px 0 0;font-size:11px;color:#a1a1aa;line-height:1.5;text-align:center;">
Review management powered by <a href="${href}" style="color:#71717a;text-decoration:underline;">Zyene Reviews</a>
</p>`;
}

export function plgEmailFooterPlain(): string {
    return `\n\nReview management powered by Zyene Reviews — ${buildPlgMarketingUrl("review-request")}`;
}
