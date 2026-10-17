import type { Plan } from "@/services/stripe/plan-catalog";

/**
 * Five or six grouped highlights per plan card. Numbers come from the plan's limits so cards
 * cannot drift from billing; the full per-feature breakdown lives in pricing-plan-matrix.ts.
 */
const n = (value: number) => value.toLocaleString("en-US");

export function getPlanHighlights(plan: Plan): string[] {
  const { limits } = plan;
  if (plan.id === "enterprise") {
    return [
      "Everything in Professional",
      "Unlimited locations, team members and requests",
      "White-label widgets and managed API keys",
      "Custom integrations and SSO, as agreed",
      "Dedicated account manager",
      "Uptime SLA and security review options",
    ];
  }
  if (limits.perLocation) {
    return [
      "Everything in Starter",
      `Up to ${limits.maxLocations} locations and ${limits.teamMembers} team members`,
      `${n(limits.emailRequestsPerMonth)} email and ${n(limits.smsRequestsPerMonth)} SMS requests a month, per location`,
      `${n(limits.linkRequestsPerMonth)} link requests and ${n(limits.smartRepliesPerMonth)} AI customer drafts, per location`,
      "Priority customer support",
    ];
  }
  return [
    `1 location and up to ${limits.teamMembers} team members`,
    "Google, Facebook and Yelp reviews in one inbox",
    `${n(limits.emailRequestsPerMonth)} email and ${n(limits.smsRequestsPerMonth)} SMS review requests a month`,
    "Unlimited AI drafts and automatic Google replies",
    "Private feedback, review widgets and competitor tracking",
    "Campaigns, POS triggers and a developer API",
  ];
}
