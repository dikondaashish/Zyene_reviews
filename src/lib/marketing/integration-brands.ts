/** Integration brand chips — colors reference CSS variables from globals.css. */

export interface IntegrationBrandChip {
    name: string;
    letter: string;
    /** CSS `background-color` value (design token). */
    color: string;
}

export const INTEGRATION_BRAND_CHIPS: IntegrationBrandChip[] = [
    { name: "Google Business Profile", color: "var(--brand-google)", letter: "G" },
    { name: "Facebook Reviews", color: "var(--brand-facebook)", letter: "f" },
    { name: "Yelp", color: "var(--brand-yelp)", letter: "Y" },
    { name: "Zapier", color: "var(--brand-zapier)", letter: "Z" },
    { name: "Square", color: "var(--brand-square)", letter: "S" },
    { name: "REST API", color: "var(--brand-api-neutral)", letter: "</>" },
];
