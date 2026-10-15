import { PLAN_MAP } from "@/services/stripe/plan-catalog";

/** Public first-party sources checked October 11, 2026; quotes are not list prices. */
export const COMPETITOR_FACTS_CHECKED_ON = "October 11, 2026";
export const VERIFIED_COMPETITOR_FACTS = {
  birdeye: {
    name: "Birdeye", price: "Custom quote",
    pricingNote: "Request pricing for your products, location count and contract terms.",
    aiReplies: "Available; confirm included plan",
    competitorTracking: "Available; confirm included products",
    sending: "Confirm allowances in your quote",
    terms: "Confirm term and renewal in your quote", trial: "Ask sales",
    source: "https://birdeye.com/pricing/",
    bestFor: "Teams buying a broader suite of reviews, listings, messaging and customer experience products.",
  },
  podium: {
    name: "Podium", price: "Custom quote",
    pricingNote: "Talk to sales for plan pricing, scope of use and optional products.",
    aiReplies: "Confirm review-reply scope with sales",
    competitorTracking: "Confirm with sales",
    sending: "Confirm bulk-message and carrier allowances",
    terms: "Confirm term and renewal in your quote", trial: "Ask sales",
    source: "https://www.podium.com/pricing",
    bestFor: "Teams that need customer messaging, phones, payments and lead management alongside reviews.",
  },
  nicejob: {
    name: "NiceJob", price: "Starter $75/month",
    pricingNote: "Starter $75/month USD; Pro $125/month USD. Website services cost extra.",
    aiReplies: "Pro ($125/month)",
    competitorTracking: "Pro ($125/month)",
    sending: "SMS and email review requests; confirm allowances",
    terms: "No contract lock-in advertised", trial: "14 days",
    source: "https://get.nicejob.com/pricing",
    bestFor: "Service businesses wanting collection and social sharing, or Pro campaigns, AI replies and competitive insights.",
  },
  gatherup: {
    name: "GatherUp", price: "$99/month, one location",
    pricingNote: "Single location $99/month; 2–10 locations $60/month per location. Annual pricing differs.",
    aiReplies: "AI-crafted replies in all plans",
    competitorTracking: "Confirm scope of Review Defense add-on",
    sending: "Up to 300 SMS and 3,000 email credits per location/month",
    terms: "Compare monthly and annual subscriptions", trial: "14 days",
    source: "https://gatherup.com/pricing/",
    bestFor: "Teams needing broad review-site monitoring, surveys and higher included sending allowances.",
  },
} as const;

export const STARTER_REQUEST_ALLOWANCE =
  `Starter: ${PLAN_MAP.starter_monthly.limits.smsRequestsPerMonth} SMS + ${PLAN_MAP.starter_monthly.limits.emailRequestsPerMonth} email requests/month`;

export const VERIFIED_COMPARISON_ROWS = [
  { feature: "Starting monthly price", zyene: "$29.99/month", birdeye: VERIFIED_COMPETITOR_FACTS.birdeye.price, podium: VERIFIED_COMPETITOR_FACTS.podium.price, nicejob: VERIFIED_COMPETITOR_FACTS.nicejob.price },
  { feature: "Billing terms", zyene: "Monthly or annual", birdeye: VERIFIED_COMPETITOR_FACTS.birdeye.terms, podium: VERIFIED_COMPETITOR_FACTS.podium.terms, nicejob: VERIFIED_COMPETITOR_FACTS.nicejob.terms },
  { feature: "Trial", zyene: "Eligible 7-day trial; card required", birdeye: VERIFIED_COMPETITOR_FACTS.birdeye.trial, podium: VERIFIED_COMPETITOR_FACTS.podium.trial, nicejob: VERIFIED_COMPETITOR_FACTS.nicejob.trial },
  { feature: "Business reply automation", zyene: "AI drafts + optional automatic Google replies", birdeye: VERIFIED_COMPETITOR_FACTS.birdeye.aiReplies, podium: VERIFIED_COMPETITOR_FACTS.podium.aiReplies, nicejob: VERIFIED_COMPETITOR_FACTS.nicejob.aiReplies },
  { feature: "Competitor tracking", zyene: "Included in paid plans", birdeye: VERIFIED_COMPETITOR_FACTS.birdeye.competitorTracking, podium: VERIFIED_COMPETITOR_FACTS.podium.competitorTracking, nicejob: VERIFIED_COMPETITOR_FACTS.nicejob.competitorTracking },
  { feature: "Request allowances", zyene: STARTER_REQUEST_ALLOWANCE, birdeye: VERIFIED_COMPETITOR_FACTS.birdeye.sending, podium: VERIFIED_COMPETITOR_FACTS.podium.sending, nicejob: VERIFIED_COMPETITOR_FACTS.nicejob.sending },
] as const;
