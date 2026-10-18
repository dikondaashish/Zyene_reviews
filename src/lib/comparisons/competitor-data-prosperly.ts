import type { CompetitorEntry } from "@/lib/comparisons/competitor-data";

/** Prosperly page copy; prices and sourced differences live in competitor-facts-published.ts. */
export const prosperlyComparison: CompetitorEntry = {
    slug: "prosperly",
    name: "Prosperly",
    keyAngle: "A law- and insurance-focused review workflow vs review tools for any local business.",
    heroSub:
        "Prosperly is positioned for law firms and insurance agencies, with referrals and an account manager. Zyene Reviews serves local businesses in any industry.",
    metaTitle: "Zyene Reviews vs Prosperly: 2026 Comparison",
    metaDescription:
        "Compare Zyene Reviews and Prosperly on pricing and setup fees, review requests, AI replies, referrals, surveys, widgets, API access and ideal fit.",
    targetKeywords: [
        "zyene reviews vs prosperly",
        "prosperly alternative",
        "prosperly pricing comparison",
        "law firm review management software",
        "insurance review management software",
    ],
    openingSummary:
        "Prosperly charges $119 or $179 a month per Google location, plus a one-time $299 setup fee, and is positioned for law firms and insurance agencies. It includes a referral program, and its Ultimate plan adds surveys and an account manager. Zyene Reviews starts at $29.99 a month, syncs Google, Facebook and Yelp, and includes AI replies, competitor tracking, widgets and API access.",
    pickCompetitorInstead:
        "Pick Prosperly if you run a law firm or insurance agency and want its referral program, Ultimate surveys and a dedicated account manager.",
    quickTable: [
        { feature: "Published monthly pricing", zyene: "Starter: $29.99/mo", competitor: "Core: $119/mo per location" },
        { feature: "Published higher plan", zyene: "Professional: $59.99/mo", competitor: "Ultimate: $179/mo per location" },
        { feature: "One-time setup fee", zyene: "Self-serve signup", competitor: "$299 setup and onboarding" },
        { feature: "Primary positioning", zyene: "Local businesses across industries", competitor: "Law firms & insurance agencies" },
        { feature: "Review sources", zyene: "Google, Facebook & Yelp sync", competitor: "Priced per Google location" },
        { feature: "AI reply suggestions", zyene: "Starter and up", competitor: "Listed on Ultimate" },
        { feature: "Customer-referral program", zyene: "Not offered", competitor: "Included on Core" },
        { feature: "Competitor tracking", zyene: "Starter and up", competitor: "Not listed on plans page" },
        { feature: "Widgets & API", zyene: "Starter and up", competitor: "Not listed on plans page" },
    ],
    whoShouldUseCompetitor: [
        "A law firm or insurance agency that wants a vertically positioned review workflow",
        "A team that wants a customer-referral program built into its review process",
        "A buyer who needs custom feedback surveys and a dedicated account manager (Ultimate)",
    ],
    whoShouldUseZyene: [
        "A local business in any industry that needs reviews across Google, Facebook and Yelp",
        "A buyer who needs competitor tracking or Google Business Profile keyword insights",
        "A business that needs review widgets or REST API access",
        "An owner-operator looking for published pricing from $29.99/mo and self-serve signup",
    ],
    visual: {
        key: "review-inbox",
        title: "Google, Facebook and Yelp in one inbox",
        caption: "Zyene's review inbox with platform badges, a Needs reply filter and a separate tab for private feedback. Prosperly's plans are priced per Google location.",
    },
    switching: {
        intro: "Moving is mostly about contacts and referral habits.",
        steps: [
            "Export clients who agreed to hear from you and import the CSV into Zyene.",
            "Connect Google Business Profile, plus Facebook and Yelp if clients review you there.",
            "Decide how you will run referrals, since Zyene has no referral module.",
            "Prosperly lists month-to-month plans with no cancellation fee; stop its requests before Zyene's begin.",
        ],
    },
    relatedPillars: ["review-monitoring", "local-seo", "review-widgets"],
    faqs: [
        {
            question: "How does Zyene Reviews pricing compare with Prosperly?",
            answer:
                "Zyene Reviews Starter is $29.99/month. Prosperly’s plans page listed Core at $119/month and Ultimate at $179/month per Google business location, plus a one-time $299 setup and onboarding fee, when we checked on October 17, 2026. Confirm current terms with each vendor before buying.",
        },
        {
            question: "Does Zyene Reviews include a customer-referral program?",
            answer:
                "No. Prosperly lists a customer-referral program on Core. If referral tracking is central to your practice, weigh that before choosing.",
        },
        {
            question: "Can both products handle negative customer feedback?",
            answer:
                "Zyene Reviews offers an optional private feedback form and team alerts, while every customer still gets the same public review link. Prosperly lists its own feedback tools. Follow each review platform’s policies when you design outreach.",
        },
        {
            question: "Does Zyene Reviews include custom feedback surveys?",
            answer:
                "No. Prosperly lists custom feedback surveys on its Ultimate plan. Zyene Reviews has a private feedback form, not a survey builder.",
        },
        {
            question: "Which product fits a local business?",
            answer:
                "Zyene Reviews is built for local businesses across industries that need Google, Facebook and Yelp reviews, AI reply tools, competitor tracking, Google Business Profile insights, widgets and API access. Prosperly is worth evaluating if you run a law firm or insurance agency.",
        },
    ],
    accentColor: "orange",
};
