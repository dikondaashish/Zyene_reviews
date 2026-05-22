// ─────────────────────────────────────────────────────────────────────────────
// Meta (Facebook/Instagram) Ads — Phase 6
// ─────────────────────────────────────────────────────────────────────────────

export type MetaAudienceType = "industry" | "retarget_competitor" | "retarget_site";

export interface MetaAdsCampaign {
    audience: MetaAudienceType;
    audienceLabel: string;
    creativeHook: string;
    creativeDetail: string;
    landingPath: string;
    utmCampaign: string;
    headline: string;
    subheadline: string;
}

export const META_ADS_CAMPAIGNS: MetaAdsCampaign[] = [
    {
        audience: "industry",
        audienceLabel: "Local business owners (restaurants)",
        creativeHook: "From 12 reviews to 87 in 60 days",
        creativeDetail: "Before/after review count for restaurants.",
        landingPath: "/industries/restaurants",
        utmCampaign: "meta_industry_restaurants",
        headline: "Real results from businesses like yours",
        subheadline: "See how local owners grew Google reviews with automated requests and AI replies.",
    },
    {
        audience: "industry",
        audienceLabel: "Local business owners (dental)",
        creativeHook: "From 23 to 89 Google reviews in 90 days",
        creativeDetail: "Before/after review count for dental practices.",
        landingPath: "/industries/dental",
        utmCampaign: "meta_industry_dental",
        headline: "Dental practices growing reviews on autopilot",
        subheadline: "SMS requests, private feedback routing, and AI replies — starting at $29.99/mo.",
    },
    {
        audience: "industry",
        audienceLabel: "Local business owners (home services)",
        creativeHook: "From 18 to 72 Google reviews in 60 days",
        creativeDetail: "Before/after review count for HVAC and contractors.",
        landingPath: "/industries/home-services",
        utmCampaign: "meta_industry_home_services",
        headline: "Contractors winning more jobs from Google",
        subheadline: "Post-job SMS review requests and AI replies — from $29.99/mo.",
    },
    {
        audience: "industry",
        audienceLabel: "Local business owners (salons)",
        creativeHook: "From 14 to 61 five-star reviews in 45 days",
        creativeDetail: "Before/after review count for salons and spas.",
        landingPath: "/industries/salons",
        utmCampaign: "meta_industry_salons",
        headline: "Salons filling chairs with stronger Google ratings",
        subheadline: "Post-appointment SMS and AI thank-you replies on every plan.",
    },
    {
        audience: "industry",
        audienceLabel: "Local business owners (auto repair)",
        creativeHook: "From 9 to 54 Google reviews in 60 days",
        creativeDetail: "Before/after review count for auto shops.",
        landingPath: "/industries/auto-repair",
        utmCampaign: "meta_industry_auto_repair",
        headline: "Auto shops closing the review gap vs. chains",
        subheadline: "SMS at pickup, competitor tracking, and AI replies.",
    },
    {
        audience: "retarget_competitor",
        audienceLabel: "Birdeye / Podium page visitors",
        creativeHook: "$30/mo vs $300/mo",
        creativeDetail: "Price comparison for visitors who compared enterprise tools.",
        landingPath: "/compare/birdeye",
        utmCampaign: "meta_retarget_compare",
        headline: "Same outcomes. A fraction of the price.",
        subheadline: "Zyene Reviews starts at $29.99/mo — no annual contract, 7-day free trial.",
    },
    {
        audience: "retarget_competitor",
        audienceLabel: "Podium comparison visitors",
        creativeHook: "$30/mo vs $399/mo",
        creativeDetail: "Podium retarget — SMS review requests without the enterprise price tag.",
        landingPath: "/compare/podium",
        utmCampaign: "meta_retarget_podium",
        headline: "Podium costs $399/mo. Zyene starts at $29.99.",
        subheadline: "Same SMS review requests and inbox — 7-day free trial, no annual contract.",
    },
    {
        audience: "retarget_site",
        audienceLabel: "Website visitors (retarget)",
        creativeHook: "Social proof + trial CTA",
        creativeDetail: "Star rating, case studies, and 7-day trial for warm traffic.",
        landingPath: "/pricing",
        utmCampaign: "meta_retarget_pricing",
        headline: "Ready to grow your Google reviews?",
        subheadline: "Join local businesses on Zyene — full access free for 7 days.",
    },
];

export function getMetaAdsBanner(utmCampaign: string | null | undefined): MetaAdsCampaign | null {
    if (!utmCampaign) return null;
    const normalized = utmCampaign.toLowerCase();
    return (
        META_ADS_CAMPAIGNS.find((c) => c.utmCampaign === normalized) ??
        META_ADS_CAMPAIGNS.find((c) => normalized.startsWith("meta_industry")) ??
        null
    );
}
