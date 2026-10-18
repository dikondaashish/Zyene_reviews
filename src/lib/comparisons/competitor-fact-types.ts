import { PLAN_MAP } from "@/services/stripe/plan-catalog";

/** One competitor difference, cited to the vendor's own pricing or feature page. */
export interface SourcedDifference {
  topic: string;
  competitor: string;
  zyene: string;
  source: { label: string; href: string };
}

/**
 * Public facts about one competitor. Compare pages and pricing blog posts both
 * read these, so a figure changes in one place. Use "Not published" for gaps.
 */
export interface CompetitorFactSheet {
  name: string;
  price: string;
  /** Third-party estimate for vendors that sell by quote. Never a vendor list price; always label it as reported. */
  reportedPrice?: string;
  pricingNote: string;
  aiReplies: string;
  competitorTracking: string;
  sending: string;
  terms: string;
  trial: string;
  /** Official pricing or plans page. */
  source: string;
  bestFor: string;
  /** Date the official pages were last read. */
  checkedOn: string;
  differences: SourcedDifference[];
}

const starter = PLAN_MAP.starter_monthly;
const pro = PLAN_MAP.professional_monthly;

/** Zyene's side of every comparison, derived from the plan catalog where possible. */
export const ZYENE_FACTS = {
  starterPrice: `Starter $${starter.price}/month for one location`,
  proPrice: `Professional $${pro.price}/month for up to ${pro.limits.maxLocations} locations`,
  published: `Published prices: Starter $${starter.price}/month (one location), Professional $${pro.price}/month (up to ${pro.limits.maxLocations} locations)`,
  starterAllowance: `Starter: ${starter.limits.smsRequestsPerMonth} SMS + ${starter.limits.emailRequestsPerMonth} email requests/month`,
  proAllowance: `Professional: ${pro.limits.smsRequestsPerMonth} SMS + ${pro.limits.emailRequestsPerMonth} email requests/month per location`,
  trial: "7-day trial on eligible plans; card required",
  terms: "Monthly or annual billing; no annual contract required",
  replies: "AI drafts you approve, plus optional automatic replies to new Google reviews at a star rating you choose",
  inbox: "Google, Facebook and Yelp reviews in one inbox; replies to Google post from Zyene",
  triggers: "Webhook and REST API request triggers (for example a Zapier step); Square in early access",
  competitors: "Competitor tracking included on Starter and Professional",
} as const;
