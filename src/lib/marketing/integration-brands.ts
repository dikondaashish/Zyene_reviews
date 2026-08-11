/** Integration brand chips — colors reference CSS variables from globals.css. */

export interface IntegrationBrandChip {
    name: string;
    letter: string;
    /** CSS `background-color` value (design token). Used as fallback when no logo domain is set. */
    color: string;
    /** Root domain to fetch a real logo for via Google's favicon service. Omit for non-brand entries (e.g. "REST API"). */
    domain?: string;
}

export const INTEGRATION_BRAND_CHIPS: IntegrationBrandChip[] = [
    { name: "Google Business Profile", color: "var(--brand-google)", letter: "G", domain: "google.com" },
    { name: "Facebook Reviews", color: "var(--brand-facebook)", letter: "f", domain: "facebook.com" },
    { name: "Yelp", color: "var(--brand-yelp)", letter: "Y", domain: "yelp.com" },
    { name: "Zapier", color: "var(--brand-zapier)", letter: "Z", domain: "zapier.com" },
    { name: "Square", color: "var(--brand-square)", letter: "S", domain: "squareup.com" },
    { name: "REST API", color: "var(--brand-api-neutral)", letter: "</>" },
];

/** Builds a high-res logo URL for a brand domain via Google's favicon service. */
export function getBrandLogoUrl(domain: string): string {
    return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`;
}
