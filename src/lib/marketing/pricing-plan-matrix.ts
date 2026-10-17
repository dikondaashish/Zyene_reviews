import { PLAN_MAP } from "@/services/stripe/plan-catalog";
import type { PlanLimits } from "@/services/stripe/plan-catalog";

/** Cell value: true = included, false = not included, string = a specific allowance. */
export type MatrixValue = boolean | string;
export type MatrixRow = { feature: string; values: [MatrixValue, MatrixValue, MatrixValue] };
export type MatrixGroup = { title: string; rows: MatrixRow[] };

const STARTER = PLAN_MAP.starter_monthly.limits;
const PRO = PLAN_MAP.professional_monthly.limits;

const amount = (value: number, perLocation = false) =>
  value < 0 ? "Unlimited" : `${value.toLocaleString("en-US")}${perLocation ? " per location" : ""}`;

function limitRow(feature: string, key: keyof Omit<PlanLimits, "perLocation">): MatrixRow {
  return { feature, values: [amount(STARTER[key] as number), amount(PRO[key] as number, Boolean(PRO.perLocation)), "Unlimited"] };
}

const all = (feature: string): MatrixRow => ({ feature, values: [true, true, true] });

/** Every line from the plan catalog's feature lists, grouped so the cards can stay short. */
export const PLAN_MATRIX: MatrixGroup[] = [
  {
    title: "Locations and team",
    rows: [
      { feature: "Business locations", values: [amount(STARTER.maxLocations), amount(PRO.maxLocations), "Unlimited"] },
      { feature: "Team members", values: [amount(STARTER.teamMembers), amount(PRO.teamMembers), "Unlimited"] },
    ],
  },
  {
    title: "Monthly allowances",
    rows: [
      limitRow("Email review requests", "emailRequestsPerMonth"),
      limitRow("SMS review requests", "smsRequestsPerMonth"),
      limitRow("Review link requests", "linkRequestsPerMonth"),
      limitRow("AI customer review drafts", "smartRepliesPerMonth"),
      all("AI business drafts and automatic Google replies (unlimited)"),
    ],
  },
  {
    title: "Collect and respond",
    rows: [
      all("Google Business Profile, Facebook and Yelp review sync"),
      all("Branded review pages, shareable links and QR codes"),
      all("Private customer feedback and recovery alerts"),
      all("Scheduled campaigns and follow-up reminders"),
      all("Customer contacts with CSV import and export"),
      all("POS and automation triggers for review requests"),
    ],
  },
  {
    title: "Insights and integrations",
    rows: [
      all("Competitor tracking"),
      all("Google Business Profile insights and search keywords"),
      all("Dashboard analytics, team alerts and CSV exports"),
      { feature: "Embeddable review widgets", values: [true, true, "Includes white-label"] },
      { feature: "Developer API", values: [true, true, "Managed keys and support"] },
    ],
  },
  {
    title: "Support and security",
    rows: [
      { feature: "Priority customer support", values: [false, true, true] },
      { feature: "Dedicated account manager", values: [false, false, true] },
      { feature: "Priority sync pipelines and proactive monitoring", values: [false, false, true] },
      { feature: "Custom integrations and SSO", values: [false, false, "As agreed"] },
      { feature: "Uptime SLA and security review options", values: [false, false, true] },
    ],
  },
];
