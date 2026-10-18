import { ZYENE_FACTS, type CompetitorFactSheet } from "@/lib/comparisons/competitor-fact-types";

/** Vendors with public price lists. Read from their own sites on October 17, 2026. */
const CHECKED_ON = "October 17, 2026";
const NICEJOB_PRICING = { label: "NiceJob pricing", href: "https://get.nicejob.com/pricing" };
const GATHERUP_PRICING = { label: "GatherUp pricing", href: "https://gatherup.com/pricing/" };
const PROSPERLY_PLANS = { label: "Prosperly plans", href: "https://prosperly.com/plans/" };

export const NICEJOB_FACTS: CompetitorFactSheet = {
  name: "NiceJob", price: "Starter $75/month",
  pricingNote: "Starter $75/month USD; Pro $125/month USD. The Sites add-on costs extra.",
  aiReplies: "Pro only ($125/month)",
  competitorTracking: "Pro only ($125/month)",
  sending: "SMS and email review requests; allowance not published",
  terms: "No contract for single locations; multi-location plans have contracts",
  trial: "14 days, no card required",
  source: NICEJOB_PRICING.href,
  bestFor: "Home-service teams on Jobber or Housecall Pro who want native connectors, social posting and referrals.",
  checkedOn: CHECKED_ON,
  differences: [
    { topic: "Published pricing", competitor: "Starter $75/month and Pro $125/month, in USD.", zyene: ZYENE_FACTS.published, source: NICEJOB_PRICING },
    {
      topic: "AI replies and competitor tracking",
      competitor: "Auto-written review replies and competitor tracking are Pro features ($125/month).",
      zyene: "AI reply drafts, optional automatic Google replies and competitor tracking are all on Starter.",
      source: NICEJOB_PRICING,
    },
    {
      topic: "Field-service integrations",
      competitor: "Lists native integrations with Jobber, Housecall Pro, QuickBooks, FieldPulse, HubSpot, CompanyCam and Clio.",
      zyene: `No native field-service connectors. ${ZYENE_FACTS.triggers}.`,
      source: { label: "NiceJob integrations", href: "https://partners.nicejob.com/integrations" },
    },
    {
      topic: "Marketing extras",
      competitor: "Starter includes social auto-posting, a team leaderboard and a reviews microsite; Pro adds referrals and NPS surveys.",
      zyene: "No referral program, NPS surveys or social auto-posting. Includes a branded review page, QR codes and embeddable review widgets.",
      source: NICEJOB_PRICING,
    },
    {
      topic: "Trial and contract",
      competitor: "14-day trial with no card required. Single-location plans have no contract; multi-location and franchise plans do.",
      zyene: `${ZYENE_FACTS.trial}. ${ZYENE_FACTS.terms}.`,
      source: { label: "NiceJob product facts", href: "https://get.nicejob.com/nicejob-llm-info" },
    },
  ],
};

export const GATHERUP_FACTS: CompetitorFactSheet = {
  name: "GatherUp", price: "$99/month, one location",
  pricingNote: "Single location $99/month; 2–10 locations $60/month per location. Annual billing is listed as 20% less.",
  aiReplies: "AI-crafted replies on every plan",
  competitorTracking: "Part of the Review Defense add-on; price not listed",
  sending: "Up to 300 SMS + 3,000 email credits per location/month",
  terms: "Monthly or annual; contract terms not published", trial: "14 days",
  source: GATHERUP_PRICING.href,
  bestFor: "Teams that need monitoring beyond Google, Facebook and Yelp, NPS surveys, or a large email allowance.",
  checkedOn: CHECKED_ON,
  differences: [
    {
      topic: "Published pricing",
      competitor: "Small Business is $99/month for one location. Multi Location is $60 per location per month for 2–10 locations.",
      zyene: ZYENE_FACTS.published,
      source: GATHERUP_PRICING,
    },
    {
      topic: "Sending allowance",
      competitor: "Up to 300 SMS and 3,000 email credits per location each month on every plan.",
      zyene: `${ZYENE_FACTS.starterAllowance}. ${ZYENE_FACTS.proAllowance}.`,
      source: GATHERUP_PRICING,
    },
    {
      topic: "Sites monitored",
      competitor: "Review monitoring across 100+ review sites on every plan.",
      zyene: "Google, Facebook and Yelp. Other sites need their own tools.",
      source: GATHERUP_PRICING,
    },
    {
      topic: "Surveys",
      competitor: "NPS and customer surveys are included on every plan.",
      zyene: "A private feedback form and team alerts. No NPS survey product.",
      source: GATHERUP_PRICING,
    },
    {
      topic: "Competitor monitoring",
      competitor: "Listed under the Review Defense add-on, which has three plans with prices not shown.",
      zyene: ZYENE_FACTS.competitors,
      source: GATHERUP_PRICING,
    },
  ],
};

export const PROSPERLY_FACTS: CompetitorFactSheet = {
  name: "Prosperly", price: "Core $119/month",
  pricingNote: "Core $119/month and Ultimate $179/month per Google location, plus a one-time $299 setup and onboarding fee.",
  aiReplies: "Ultimate only ($179/month)",
  competitorTracking: "Not listed on the plans page",
  sending: "Not published",
  terms: "Month to month; cancel anytime without fees", trial: "Not published",
  source: PROSPERLY_PLANS.href,
  bestFor: "Law firms and insurance agencies that want a referral program and an account manager.",
  checkedOn: CHECKED_ON,
  differences: [
    {
      topic: "Published pricing",
      competitor: "Core $119/month and Ultimate $179/month per Google business location, plus a one-time $299 setup and onboarding fee.",
      zyene: `${ZYENE_FACTS.published}, with self-serve signup.`,
      source: PROSPERLY_PLANS,
    },
    {
      topic: "Referral program",
      competitor: "A customer-referral program is included on Core.",
      zyene: "No referral module.",
      source: PROSPERLY_PLANS,
    },
    {
      topic: "AI and surveys",
      competitor: "AI review suggestions and custom feedback surveys are listed on Ultimate.",
      zyene: "AI reply drafts are on Starter. A private feedback form, but no custom survey builder.",
      source: PROSPERLY_PLANS,
    },
    {
      topic: "Account management",
      competitor: "Ultimate lists a dedicated account manager.",
      zyene: "Self-serve setup with support; Professional adds priority support.",
      source: PROSPERLY_PLANS,
    },
  ],
};
