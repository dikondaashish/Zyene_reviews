import type { ContentSection } from "@/lib/content/blog-types";
import { COMPETITOR_FACTS_CHECKED_ON, VERIFIED_COMPETITOR_FACTS } from "@/lib/comparisons/verified-competitor-facts";
import { TRIAL_SUMMARY } from "@/lib/marketing/trial-copy";

export const VENDOR_QUOTE_CHECKLIST: ContentSection[] = [
  { type: "h2", text: "Compare an itemized quote, using the same requirements" },
  { type: "ol", items: [
    "List locations, users, review sites and integration actions. Ask the vendor to demonstrate those exact actions.",
    "Specify monthly SMS and email volume. Ask about credits, carrier charges, registration, overages and taxes.",
    "Separate AI drafting from automatic publishing. Confirm supported sites, eligible reviews and approval controls.",
    "Ask which products are included, which are optional, and whether implementation or training costs extra.",
    "Read billing periods, minimum terms, renewal, cancellation notice and data-export conditions on the order form.",
    "Compare twelve-month total costs, including one-time charges. A monthly equivalent is not necessarily monthly billing.",
  ] },
  { type: "h2", text: "Test the workflow before switching" },
  { type: "p", text: "Use a test location or demonstration. Check how reviews arrive, who can publish replies, how requests are scheduled and how opted-out contacts are handled. Confirm export access. Keep your old process available until the replacement works for your team." },
  { type: "p", text: `Zyene Starter monthly is $29.99 for one location; Professional is $59.99 for up to three locations. Annual plans have different upfront prices. ${TRIAL_SUMMARY}` },
  { type: "cta", ctaLabel: "Check Zyene plans, limits and billing periods", ctaHref: "/pricing" },
];

export const VENDOR_COMPARISON_TABLE: ContentSection = {
  type: "table", table: {
    headers: ["Platform", "Public monthly pricing", "Reply tools", "Potential fit"],
    rows: [
      ["Zyene Reviews", "Starter $29.99; Professional $59.99", "AI drafts; optional automatic Google replies", "Review inbox, requests and GBP insights"],
      ...Object.values(VERIFIED_COMPETITOR_FACTS).map((facts) => [facts.name, facts.price, facts.aiReplies, facts.bestFor]),
    ],
  },
};

export const VENDOR_SOURCE_LINKS: ContentSection[] = [
  { type: "p", text: `Public pricing and plan facts checked ${COMPETITOR_FACTS_CHECKED_ON}. Quotes, allowances and products can change. Sources:` },
  ...Object.values(VERIFIED_COMPETITOR_FACTS).map((facts): ContentSection => ({
    type: "cta", ctaLabel: `${facts.name} official pricing and plans`, ctaHref: facts.source,
  })),
];
