import type { CompetitorEntry } from "@/lib/comparisons/competitor-data";

/** NiceJob and GatherUp publish prices; facts and sources live in competitor-facts-published.ts. */
export const nicejobComparison: CompetitorEntry = {
    slug: "nicejob",
    name: "NiceJob",
    keyAngle: "Native field-service connectors vs AI replies and competitor tracking on the entry plan.",
    heroSub: "NiceJob connects natively to Jobber and Housecall Pro and adds social posting. Zyene Reviews puts AI replies and competitor tracking on its $29.99 plan.",
    metaTitle: "NiceJob Alternative: Zyene vs NiceJob (2026)",
    metaDescription: "NiceJob vs Zyene Reviews: $75 vs $29.99 entry plans, AI replies and competitor tracking by tier, field-service integrations and trials. Sources included.",
    targetKeywords: ["nicejob alternative", "nicejob alternatives", "zyene vs nicejob", "nicejob competitors", "yotpo vs nicejob"],
    openingSummary: "NiceJob Starter is $75 a month and Pro is $125; AI replies and competitor tracking are Pro features. Zyene Reviews Starter is $29.99 and includes both. NiceJob's edge is native connectors for tools like Jobber and Housecall Pro, plus social posting and referrals. Zyene triggers requests from a webhook or its API instead, so check that your job software can send one.",
    pickCompetitorInstead: "Pick NiceJob if you run on Jobber or Housecall Pro and want a native connector, social auto-posting or a referral program.",
    whoShouldUseCompetitor: [
        "Home-service teams that want a native Jobber, Housecall Pro or QuickBooks connector",
        "Businesses that want reviews posted to social media automatically",
        "Owners who want referral campaigns and NPS surveys in the same tool",
    ],
    whoShouldUseZyene: [
        "Owners who want AI replies and competitor tracking without paying for a Pro tier",
        "Teams comfortable sending a webhook from Zapier or their job software",
        "Businesses that want Google, Facebook and Yelp reviews in one inbox",
    ],
    visual: {
        key: "request-triggers",
        title: "How Zyene gets the job-complete signal",
        caption: "Zyene has no native Jobber or Housecall Pro connector. Requests start from the REST API, a webhook such as a Zapier step, or a Square payment (early access).",
    },
    switching: {
        intro: "Test the job-complete trigger before you turn NiceJob off.",
        steps: [
            "Export your customer list from NiceJob or your job software and import the CSV into Zyene.",
            "Build a Zapier step (or an API call) that fires when a job is marked complete, and send one test request to yourself.",
            "Connect Google Business Profile, Facebook and Yelp so existing reviews sync in.",
            "Turn off NiceJob's automatic requests the day Zyene's start, so no customer is asked twice.",
            "Replace any NiceJob website widget with a Zyene review widget if you use one.",
        ],
    },
    relatedPillars: ["review-collection", "competitor-tracking", "review-widgets"],
    guides: [{ label: "Birdeye alternatives, including NiceJob", href: "/blog/birdeye-alternatives-for-local-businesses" }],
    faqs: [
        { question: "How does NiceJob pricing compare with Zyene Reviews?", answer: "NiceJob listed Starter at $75/month and Pro at $125/month (USD) when we checked on October 17, 2026. Zyene Reviews Starter is $29.99/month for one location and Professional is $59.99/month for up to three." },
        { question: "Does Zyene Reviews connect to Jobber or Housecall Pro?", answer: "Not natively. NiceJob lists native integrations with Jobber, Housecall Pro, QuickBooks and others. Zyene Reviews starts requests from a webhook, such as a Zapier step on job completion, or from its REST API. Test the trigger with your software before switching." },
        { question: "Are AI replies and competitor tracking on the entry plan?", answer: "On Zyene Reviews, yes: Starter includes AI reply drafts, optional automatic Google replies and competitor tracking. NiceJob lists auto-written replies and competitor tracking on Pro ($125/month)." },
        { question: "Does Zyene Reviews have referrals, NPS surveys or social posting?", answer: "No. NiceJob lists social auto-posting on Starter and referrals and NPS surveys on Pro. Zyene Reviews offers a branded review page, QR codes, review widgets and a private feedback form instead." },
        { question: "How do the free trials differ?", answer: "NiceJob advertises a 14-day trial with no card required; its multi-location and franchise plans have contracts. Zyene Reviews offers a 7-day trial on eligible plans with a card required, billed monthly or annually with no annual contract." },
    ],
    accentColor: "blue",
};

export const gatherupComparison: CompetitorEntry = {
    slug: "gatherup",
    name: "GatherUp",
    keyAngle: "Broad monitoring, NPS and big email credits vs a lower price and built-in competitor tracking.",
    heroSub: "GatherUp monitors 100+ review sites and includes NPS surveys. Zyene Reviews covers Google, Facebook and Yelp for less, with competitor tracking built in.",
    metaTitle: "GatherUp Alternative: Zyene vs GatherUp",
    metaDescription: "GatherUp vs Zyene Reviews: $99 vs $29.99 for one location, SMS and email credits, 100+ sites vs three, NPS and competitor monitoring. Sources included.",
    targetKeywords: ["gatherup alternative", "zyene vs gatherup", "gatherup vs nicejob", "gatherup vs birdeye", "gatherup vs podium"],
    openingSummary: "GatherUp is $99 a month for one location and includes monitoring across 100+ review sites, NPS surveys and up to 3,000 email credits per location. Zyene Reviews Starter is $29.99, covers Google, Facebook and Yelp, sends more SMS but fewer emails, and includes competitor tracking that GatherUp sells in an add-on. Your channel mix and review sites decide this one.",
    pickCompetitorInstead: "Pick GatherUp if you need monitoring beyond Google, Facebook and Yelp, NPS surveys, or thousands of review emails per location.",
    whoShouldUseCompetitor: [
        "Businesses whose customers review them on industry sites beyond the big three",
        "Teams that run NPS or structured customer surveys",
        "Senders who rely on email more than SMS",
    ],
    whoShouldUseZyene: [
        "Single-location owners who want to pay $29.99 instead of $99",
        "Teams that send more texts than emails",
        "Owners who want competitor tracking included, not as an add-on",
    ],
    visual: {
        key: "competitor-board",
        title: "Competitor tracking, included",
        caption: "Zyene's rating board for you and the competitors you track, with an alert when a rival's review volume jumps. GatherUp lists competitor monitoring in its Review Defense add-on.",
    },
    switching: {
        intro: "Check which review sites you would stop monitoring before you move.",
        steps: [
            "List the review sites GatherUp monitors for you. Zyene covers Google, Facebook and Yelp only.",
            "Export customers and import the CSV into Zyene; keep opt-outs out of the import.",
            "Rebuild request triggers with a webhook or the API, and compare your monthly SMS and email volume with Zyene's allowances.",
            "Add the competitors you want to track, then pause GatherUp requests before Zyene's begin.",
        ],
    },
    relatedPillars: ["competitor-tracking", "review-monitoring", "review-campaigns"],
    guides: [{ label: "Birdeye alternatives, including GatherUp", href: "/blog/birdeye-alternatives-for-local-businesses" }],
    faqs: [
        { question: "How does GatherUp pricing compare with Zyene Reviews?", answer: "GatherUp listed $99/month for one location and $60 per location per month for 2–10 locations when we checked on October 17, 2026, with annual billing listed as 20% less. Zyene Reviews Starter is $29.99/month for one location; Professional is $59.99/month for up to three." },
        { question: "Which includes more review requests?", answer: "It depends on the channel. GatherUp includes up to 300 SMS and 3,000 email credits per location each month. Zyene Reviews Starter includes 500 SMS and 500 email requests; Professional includes 700 of each per location." },
        { question: "Which review sites does each tool monitor?", answer: "GatherUp lists monitoring across 100+ review sites. Zyene Reviews syncs Google, Facebook and Yelp. If your customers review you elsewhere, GatherUp covers more." },
        { question: "Does Zyene Reviews run NPS surveys?", answer: "No. GatherUp includes NPS and surveys on every plan. Zyene Reviews has a private feedback form with team alerts, offered alongside the same public review link every customer gets." },
        { question: "Is competitor monitoring included?", answer: "In Zyene Reviews, competitor tracking is on Starter and Professional. GatherUp lists competitor monitoring under its Review Defense add-on, whose prices were not shown on the pricing page." },
    ],
    accentColor: "blue",
};
