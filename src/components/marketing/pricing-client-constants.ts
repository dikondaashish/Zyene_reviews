import { TRIAL_DETAILS } from "@/lib/marketing/trial-copy";
export const PRICING_FAQS = [
    {
        question: "Are automatic Google replies included?",
        answer: "Yes. Starter, Professional, and Enterprise include unlimited business reply suggestions and automatic Google replies while your subscription or trial is active. Choose Professional, Friendly, or Concise and a minimum star rating for each business. Automatic mode publishes eligible new Google replies without individual approval; existing reviews are excluded. AI customer review drafts have a separate plan allowance.",
    },
    {
        question: "How does the 7-day free trial work?",
        answer: TRIAL_DETAILS,
    },
    {
        question: "What happens at the end of the trial?",
        answer:
            "Your selected subscription bills automatically after the trial unless you cancel in Billing. Check the price, billing period and any special-offer terms shown at checkout.",
    },
    {
        question: "Can I switch plans?",
        answer:
            "Yes. Upgrade or downgrade anytime from your billing settings. Upgrades take effect immediately (prorated). Downgrades take effect at the next billing cycle.",
    },
    {
        question: "What counts against my monthly review request limits?",
        answer:
            "Each email or SMS sent to a customer counts as 1 request toward your monthly quota. Shareable link views do not count; only the initial review draft generation step counts against your AI-generated review draft limit.",
    },
    {
        question: "Can I manage multiple locations?",
        answer:
            "The Starter plan covers 1 location. Professional covers up to 3 locations, each with its own independent limits (email requests, SMS, AI replies). Enterprise offers unlimited locations with custom limits.",
    },
    {
        question: "Do you offer annual billing?",
        answer:
            "Yes. Switching to annual billing saves you approximately 17% compared to monthly. Annual plans are billed once per year. You can switch from monthly to annual at any time from billing settings.",
    },
    {
        question: "Is there a free plan?",
        answer:
            "There is no ongoing free tier, but eligible new subscriptions include a 7-day trial with the selected plan’s limits. After the trial, a paid plan is required to continue using the platform.",
    },
    {
        question: "Can I cancel anytime?",
        answer:
            "Absolutely. Cancel anytime from your billing settings. No cancellation fees, no contracts, no questions asked. Your account stays active until the end of the billing period.",
    },
] as const;

export { VERIFIED_COMPARISON_ROWS as COMPARISON_ROWS } from "@/lib/comparisons/verified-competitor-facts";
