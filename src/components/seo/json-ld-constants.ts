import { MARKETING_SITE_ORIGIN, marketingCanonicalUrl } from "@/lib/seo/marketing-site-url";

export const JSON_LD_BASE_URL = MARKETING_SITE_ORIGIN;

/** Canonical organization URL for homepage / brand schema. */
export const JSON_LD_ORGANIZATION_URL = marketingCanonicalUrl("/");

export const JSON_LD_ORGANIZATION_ID = `${JSON_LD_ORGANIZATION_URL}#organization`;

export const JSON_LD_DEFAULT_OG_IMAGE = `${MARKETING_SITE_ORIGIN}/og/zyene-reviews-share.jpg`;

/** Brand / parent company and product site (sameAs). */
export const JSON_LD_ORGANIZATION_SAME_AS = [
    JSON_LD_ORGANIZATION_URL,
    "https://zyene.com",
    "https://www.linkedin.com/company/zyene-reviews/",
    "https://www.crunchbase.com/organization/zyene-reviews",
    "https://www.g2.com/products/zyene-reviews/reviews",
    "https://www.capterra.com/p/10263337/Zyene-Reviews/",
    "https://www.producthunt.com/products/zyene-reviews",
    "https://sourceforge.net/software/product/Zyene-Reviews/",
    "https://stackshare.io/zyene-reviews-review-management-for-local-businesses",
] as const;
