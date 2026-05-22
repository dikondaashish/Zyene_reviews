// ─────────────────────────────────────────────────────────────────────────────
// Growth KPI definitions — GROWTH_BLUEPRINT § KPI Dashboard
// Targets and sources are the north-star; live values come from kpi-metrics.ts
// or external dashboards linked below.
// ─────────────────────────────────────────────────────────────────────────────

export type KpiCategory = "acquisition" | "conversion" | "retention" | "plg";

export type KpiTargetDirection = "higher" | "lower";

export interface KpiDefinition {
    id: string;
    category: KpiCategory;
    name: string;
    description: string;
    source: string;
    /** Human-readable target from blueprint */
    targetLabel: string;
    /** When true, /api/internal/growth-metrics computes a value from Supabase/Stripe */
    computable: boolean;
    targetDirection: KpiTargetDirection;
    /** Numeric target for status coloring (null = qualitative / external only) */
    targetValue: number | null;
    targetUnit: "%" | "count" | "hours" | "usd" | "score" | "sessions" | null;
    externalUrl?: string;
}

export const KPI_DEFINITIONS: KpiDefinition[] = [
    // Acquisition
    {
        id: "organic_sessions_month",
        category: "acquisition",
        name: "Organic sessions / month",
        description: "Marketing site sessions from organic search (not paid).",
        source: "Vercel Analytics / Google Analytics 4",
        targetLabel: "10,000+",
        computable: false,
        targetDirection: "higher",
        targetValue: 10_000,
        targetUnit: "sessions",
        externalUrl: "https://vercel.com/analytics",
    },
    {
        id: "gsc_keywords_top20",
        category: "acquisition",
        name: "Keywords ranking top 20",
        description: "Distinct queries with average position ≤ 20 in Google Search Console.",
        source: "Google Search Console → Performance",
        targetLabel: "200+",
        computable: false,
        targetDirection: "higher",
        targetValue: 200,
        targetUnit: "count",
        externalUrl: "https://search.google.com/search-console",
    },
    {
        id: "compare_page_visits_month",
        category: "acquisition",
        name: "Comparison page visits / month",
        description: "Sessions on /compare and /compare/* competitor pages.",
        source: "GA4 / Vercel Analytics (page path filter)",
        targetLabel: "2,000 / month",
        computable: false,
        targetDirection: "higher",
        targetValue: 2000,
        targetUnit: "sessions",
    },
    {
        id: "industry_page_visits_month",
        category: "acquisition",
        name: "Industry page visits / month",
        description: "Sessions on /industries and vertical landing pages.",
        source: "GA4 / Vercel Analytics",
        targetLabel: "1,500 / month",
        computable: false,
        targetDirection: "higher",
        targetValue: 1500,
        targetUnit: "sessions",
    },

    // Conversion
    {
        id: "visitor_signup_rate",
        category: "conversion",
        name: "Visitor → signup rate",
        description: "New user.signed_up events divided by marketing sessions (same period). Set GROWTH_MARKETING_SESSIONS_30D or use Vercel/GA.",
        source: "events + GROWTH_MARKETING_SESSIONS_30D / Vercel Analytics",
        targetLabel: "3–5%",
        computable: true,
        targetDirection: "higher",
        targetValue: 3,
        targetUnit: "%",
        externalUrl: "https://vercel.com/analytics",
    },
    {
        id: "signup_google_connected_rate",
        category: "conversion",
        name: "Signup → Google connected",
        description: "Organizations with a connected Google Business Profile within 14 days of signup.",
        source: "review_platforms (platform=google) + organizations",
        targetLabel: "60%+",
        computable: true,
        targetDirection: "higher",
        targetValue: 60,
        targetUnit: "%",
    },
    {
        id: "trial_paid_conversion_rate",
        category: "conversion",
        name: "Trial → paid conversion",
        description: "Organizations that moved from trial/trialing to active paid subscription.",
        source: "organizations.plan_status + Stripe",
        targetLabel: "25–35%",
        computable: true,
        targetDirection: "higher",
        targetValue: 25,
        targetUnit: "%",
    },
    {
        id: "time_to_first_review_request_hours",
        category: "conversion",
        name: "Time to first review request",
        description: "Median hours from organization creation to first review_requests row.",
        source: "organizations + review_requests",
        targetLabel: "< 24 hours",
        computable: true,
        targetDirection: "lower",
        targetValue: 24,
        targetUnit: "hours",
    },

    // Retention & revenue
    {
        id: "monthly_churn_rate",
        category: "retention",
        name: "Monthly churn rate",
        description: "Canceled subscriptions in period ÷ active subs at period start.",
        source: "Stripe Billing → Metrics",
        targetLabel: "< 5%",
        computable: true,
        targetDirection: "lower",
        targetValue: 5,
        targetUnit: "%",
        externalUrl: "https://dashboard.stripe.com",
    },
    {
        id: "mrr_growth_mom",
        category: "retention",
        name: "MRR growth (month over month)",
        description: "Percent change in MRR vs prior month. Requires Stripe billing history or manual GROWTH_MRR_PREVIOUS_MONTH_CENTS.",
        source: "Stripe Dashboard / MRR chart",
        targetLabel: "15%+ MoM",
        computable: true,
        targetDirection: "higher",
        targetValue: 15,
        targetUnit: "%",
        externalUrl: "https://dashboard.stripe.com",
    },
    {
        id: "nps_score",
        category: "retention",
        name: "Net Promoter Score",
        description: "In-app NPS survey (% promoters − % detractors).",
        source: "PostHog / in-app survey (when launched)",
        targetLabel: "50+",
        computable: false,
        targetDirection: "higher",
        targetValue: 50,
        targetUnit: "score",
    },
    {
        id: "arpu_usd",
        category: "retention",
        name: "Average revenue per user (ARPU)",
        description: "MRR ÷ count of paying organizations.",
        source: "Stripe MRR ÷ active paid orgs",
        targetLabel: "$40+",
        computable: true,
        targetDirection: "higher",
        targetValue: 40,
        targetUnit: "usd",
    },

    // PLG / viral
    {
        id: "plg_signup_share",
        category: "plg",
        name: 'Signups from "Powered by" / PLG',
        description: "Signups with utm_source=plg or metadata.plg_ref (review page, widget, SMS/email).",
        source: "events.user.signed_up metadata",
        targetLabel: "10% of new signups",
        computable: true,
        targetDirection: "higher",
        targetValue: 10,
        targetUnit: "%",
    },
    {
        id: "widget_embed_views_month",
        category: "plg",
        name: "Widget embed views / month",
        description: "Page views on /w/[slug] public widget surfaces.",
        source: "Vercel Analytics (path /w/*)",
        targetLabel: "500+ / month",
        computable: false,
        targetDirection: "higher",
        targetValue: 500,
        targetUnit: "sessions",
    },
    {
        id: "referral_signup_share",
        category: "plg",
        name: "Referral signups",
        description: "New organizations with a referral_conversions row (any status).",
        source: "referral_conversions + events",
        targetLabel: "5% of new signups",
        computable: true,
        targetDirection: "higher",
        targetValue: 5,
        targetUnit: "%",
    },
];

export const KPI_BY_ID: Record<string, KpiDefinition> = Object.fromEntries(
    KPI_DEFINITIONS.map((k) => [k.id, k])
);
