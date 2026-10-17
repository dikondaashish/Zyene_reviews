/**
 * Copy for the /small-business landing page. Prices come from the Stripe plan
 * catalog and competitor facts from verified-competitor-facts so neither drifts.
 */
import { PLAN_MAP } from "@/services/stripe/plan-catalog";
import {
    COMPETITOR_FACTS_CHECKED_ON,
    VERIFIED_COMPETITOR_FACTS,
} from "@/lib/comparisons/verified-competitor-facts";

const starter = PLAN_MAP.starter_monthly;
const starterYearly = PLAN_MAP.starter_yearly;
const professional = PLAN_MAP.professional_monthly;

function usd(amount: number | null): string {
    return amount == null ? "Custom" : `$${amount.toFixed(2)}`;
}

export const SMALL_BUSINESS_PATH = "/small-business";
export const STARTER_PRICE = usd(starter.price);
export const STARTER_YEARLY_PRICE = usd(starterYearly.price);
export const PROFESSIONAL_PRICE = usd(professional.price);
export const STARTER_LIMITS = starter.limits;

export const SMALL_BUSINESS_TITLE = "Review Management Software for Small Business";

export const SMALL_BUSINESS_DESCRIPTION =
    `Small business review management: one inbox for Google, Yelp and Facebook reviews, AI replies, and SMS and email review requests. From ${STARTER_PRICE}/mo.`;

/** The 40–60 word above-the-fold answer that AI engines can quote directly. */
export const SMALL_BUSINESS_ANSWER =
    `Zyene Reviews is review management software for small, single-location businesses, from ${STARTER_PRICE}/mo. ` +
    "See Google, Yelp and Facebook reviews in one inbox, reply with AI drafts or automatic Google replies, " +
    "and send SMS and email review requests from the same dashboard. Billing is monthly or annual, with no long-term contract.";

export const SMALL_BUSINESS_KEYWORDS = [
    "review management software for small business",
    "small business review management",
    "affordable review management software",
];

export type SmallBusinessFeature = { title: string; description: string; href: string; linkLabel: string };

export const SMALL_BUSINESS_FEATURES: SmallBusinessFeature[] = [
    {
        title: "One inbox for Google, Yelp and Facebook",
        description:
            "Reviews from your Google Business Profile, Yelp and Facebook sync into one list, so you can see what's new and what still needs a reply without opening three apps.",
        href: "/features/review-monitoring",
        linkLabel: "How review monitoring works",
    },
    {
        title: "AI replies you can trust",
        description:
            "Get a reply draft in a Professional, Friendly or Concise tone and edit it before you post. You can also turn on automatic replies for new Google reviews by star rating.",
        href: "/features/ai-replies",
        linkLabel: "See AI review replies",
    },
    {
        title: "SMS and email review requests",
        description: `Send branded requests by text, email, link or QR code. Starter includes ${STARTER_LIMITS.smsRequestsPerMonth} SMS and ${STARTER_LIMITS.emailRequestsPerMonth} email requests a month, with scheduled campaigns and follow-up reminders.`,
        href: "/features/review-requests",
        linkLabel: "Explore review requests",
    },
    {
        title: "Private feedback, public option kept",
        description:
            "Negative Feedback Shield shows lower ratings a private form so your team can follow up quickly. That screen keeps a Go to Google link, so every customer can still post publicly.",
        href: "/features/review-collection",
        linkLabel: "How private feedback works",
    },
];

export type PriceRow = { name: string; price: string; source?: string };

const competitorKeys = ["nicejob", "gatherup", "birdeye", "podium"] as const;

export const SMALL_BUSINESS_PRICE_ROWS: PriceRow[] = [
    { name: "Zyene Reviews Starter", price: `${STARTER_PRICE}/month, one location` },
    ...competitorKeys.map((key) => ({
        name: VERIFIED_COMPETITOR_FACTS[key].name,
        price: VERIFIED_COMPETITOR_FACTS[key].price,
        source: VERIFIED_COMPETITOR_FACTS[key].source,
    })),
];

export const PRICES_CHECKED_ON = COMPETITOR_FACTS_CHECKED_ON;

export const SMALL_BUSINESS_SETUP_STEPS = [
    { title: "Sign up and pick a plan", description: "Choose Starter for one location. Sign-up takes under five minutes." },
    { title: "Connect your business", description: "Link your Google Business Profile, then Yelp and Facebook, so reviews start syncing." },
    { title: "Send your first request", description: "Add or import customers and send a request by SMS or email, usually within two minutes of finishing setup." },
];
