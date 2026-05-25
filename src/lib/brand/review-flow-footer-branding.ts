import { ZYENE_REVIEWS_LOGO_SRC } from "@/lib/brand/logo";
import { buildPlgMarketingUrl, PLG_FOOTER_LABEL } from "@/lib/growth/plg-attribution";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";

export const DEFAULT_REVIEW_FOOTER_COMPANY_NAME = PLG_FOOTER_LABEL;
export const DEFAULT_REVIEW_FOOTER_LOGO_URL = ZYENE_REVIEWS_LOGO_SRC;
export const DEFAULT_REVIEW_FOOTER_LINK = MARKETING_SITE_ORIGIN;
export const DEFAULT_REVIEW_FOOTER_TEXT = "Powered by Zyene Reviews";

function isLegacyZyeneFooter(company: string, logo: string, link: string): boolean {
    if (company === "Zyene") return true;
    if (logo.includes("zyene-footer")) return true;
    if (link === "https://zyene.com" || link === "http://zyene.com" || link === "zyene.com") {
        return true;
    }
    return false;
}

/** Maps stored DB values to product branding when legacy Zyene defaults are still saved. */
export function resolveReviewFlowFooterBranding({
    footerLink,
    footerLogoUrl,
    footerCompanyName,
}: {
    footerLink?: string;
    footerLogoUrl?: string;
    footerCompanyName?: string;
}) {
    const company = footerCompanyName?.trim() ?? "";
    const logo = footerLogoUrl?.trim() ?? "";
    const link = footerLink?.trim() ?? "";

    if (!link && !company && !logo) {
        return {
            href: buildPlgMarketingUrl("review-page"),
            logoSrc: ZYENE_REVIEWS_LOGO_SRC,
            label: PLG_FOOTER_LABEL,
        };
    }

    if (isLegacyZyeneFooter(company, logo, link)) {
        return {
            href: buildPlgMarketingUrl("review-page"),
            logoSrc: ZYENE_REVIEWS_LOGO_SRC,
            label: PLG_FOOTER_LABEL,
        };
    }

    const href = link.startsWith("http") ? link : link ? `https://${link}` : buildPlgMarketingUrl("review-page");

    return {
        href,
        logoSrc: logo || ZYENE_REVIEWS_LOGO_SRC,
        label: company || PLG_FOOTER_LABEL,
    };
}
