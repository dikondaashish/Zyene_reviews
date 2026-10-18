/** Integration brand chips - colors reference CSS variables from globals.css. */

export interface IntegrationBrandChip {
    name: string;
    letter: string;
    /** CSS `background-color` value (design token). Used as fallback when no logo domain is set. */
    color: string;
    /** Root domain to fetch a real logo for for the logo. Omit for non-brand entries (e.g. "REST API"). */
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

/** Crisp vector marks served from /public/integrations/logos, keyed by root domain. */
const LOCAL_BRAND_LOGOS: Record<string, string> = {
    "google.com": "google",
    "facebook.com": "facebook",
    "yelp.com": "yelp",
    "zapier.com": "zapier",
    "squareup.com": "square",
    "square.com": "square",
    "clover.com": "clover",
    "toasttab.com": "toast",
};

/** Logo URL for a brand domain: a local SVG when we ship one, else Google's favicon service. */
export function getBrandLogoUrl(domain: string): string {
    const local = LOCAL_BRAND_LOGOS[domain];
    if (local) return `/integrations/logos/${local}.svg`;
    return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`;
}
