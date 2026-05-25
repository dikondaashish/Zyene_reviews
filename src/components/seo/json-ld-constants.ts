import { MARKETING_SITE_ORIGIN, marketingCanonicalUrl } from "@/lib/seo/marketing-site-url";

export const JSON_LD_BASE_URL = MARKETING_SITE_ORIGIN;

/** Canonical organization URL for homepage / brand schema. */
export const JSON_LD_ORGANIZATION_URL = marketingCanonicalUrl("/");

export const JSON_LD_ORGANIZATION_ID = `${JSON_LD_ORGANIZATION_URL}#organization`;

export const JSON_LD_DEFAULT_OG_IMAGE = `${MARKETING_SITE_ORIGIN}/og/og-default.png`;

/** Brand / parent company and product site (sameAs). */
export const JSON_LD_ORGANIZATION_SAME_AS = [
    JSON_LD_ORGANIZATION_URL,
    "https://zyene.com",
] as const;
