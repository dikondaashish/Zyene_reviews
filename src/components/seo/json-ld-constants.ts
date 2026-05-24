export const JSON_LD_BASE_URL = "https://zyenereviews.com";

/** Canonical organization URL for homepage / brand schema (www). */
export const JSON_LD_ORGANIZATION_URL = "https://www.zyenereviews.com";

export const JSON_LD_ORGANIZATION_ID = `${JSON_LD_BASE_URL}/#organization`;

export const JSON_LD_DEFAULT_OG_IMAGE = `${JSON_LD_BASE_URL}/og/og-default.png`;

/** Brand / parent company and product site (sameAs). */
export const JSON_LD_ORGANIZATION_SAME_AS = [
    JSON_LD_ORGANIZATION_URL,
    JSON_LD_BASE_URL,
    "https://zyene.com",
] as const;
