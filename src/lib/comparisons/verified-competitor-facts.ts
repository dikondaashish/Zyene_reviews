import { ZYENE_FACTS, type CompetitorFactSheet } from "@/lib/comparisons/competitor-fact-types";
import { BIRDEYE_FACTS, PODIUM_FACTS } from "@/lib/comparisons/competitor-facts-quoted";
import { GATHERUP_FACTS, NICEJOB_FACTS, PROSPERLY_FACTS } from "@/lib/comparisons/competitor-facts-published";

/**
 * The one competitor fact source. Compare pages and the competitor pricing blog
 * posts both read from here, so their figures cannot drift apart.
 * Public first-party sources checked October 17, 2026; quotes are not list prices.
 */
export const COMPETITOR_FACTS_CHECKED_ON = "October 17, 2026";

/** The four vendors in the shared blog comparison table. */
export const VERIFIED_COMPETITOR_FACTS = {
  birdeye: BIRDEYE_FACTS,
  podium: PODIUM_FACTS,
  nicejob: NICEJOB_FACTS,
  gatherup: GATHERUP_FACTS,
} satisfies Record<string, CompetitorFactSheet>;

/** Every vendor with a compare page, keyed by compare slug. */
export const COMPETITOR_FACT_SHEETS: Record<string, CompetitorFactSheet> = {
  ...VERIFIED_COMPETITOR_FACTS,
  prosperly: PROSPERLY_FACTS,
};

export const STARTER_REQUEST_ALLOWANCE = ZYENE_FACTS.starterAllowance;

export const VERIFIED_COMPARISON_ROWS = [
  { feature: "Starting monthly price", zyene: "$29.99/month", birdeye: BIRDEYE_FACTS.reportedPrice ?? BIRDEYE_FACTS.price, podium: PODIUM_FACTS.reportedPrice ?? PODIUM_FACTS.price, nicejob: NICEJOB_FACTS.price },
  { feature: "Billing terms", zyene: "Monthly or annual", birdeye: BIRDEYE_FACTS.terms, podium: PODIUM_FACTS.terms, nicejob: NICEJOB_FACTS.terms },
  { feature: "Trial", zyene: "Eligible 7-day trial; card required", birdeye: BIRDEYE_FACTS.trial, podium: PODIUM_FACTS.trial, nicejob: NICEJOB_FACTS.trial },
  { feature: "Business reply automation", zyene: "AI drafts + optional automatic Google replies", birdeye: BIRDEYE_FACTS.aiReplies, podium: PODIUM_FACTS.aiReplies, nicejob: NICEJOB_FACTS.aiReplies },
  { feature: "Competitor tracking", zyene: "Included in paid plans", birdeye: BIRDEYE_FACTS.competitorTracking, podium: PODIUM_FACTS.competitorTracking, nicejob: NICEJOB_FACTS.competitorTracking },
  { feature: "Request allowances", zyene: STARTER_REQUEST_ALLOWANCE, birdeye: BIRDEYE_FACTS.sending, podium: PODIUM_FACTS.sending, nicejob: NICEJOB_FACTS.sending },
] as const;
