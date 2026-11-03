import Link from "next/link";
import { ArrowRight, BarChart3, Briefcase, Building2, MessageSquare, Store } from "lucide-react";

interface DecisionItem {
    name: string;
    pricing: string;
    summary: string;
    fit: string;
    linkHref: string;
    linkLabel: string;
}

const PLATFORM_GUIDES: DecisionItem[] = [
    {
        name: "Zyene Reviews",
        pricing: "Starter $29.99/mo (1 location) · Professional $59.99/mo (up to 3 locations)",
        summary:
            "Built for 1–5 location local operators who want transparent pricing, fast review alerts, AI reply drafts, optional automatic Google replies, and competitor tracking without enterprise sales friction.",
        fit: "Choose when you want self-serve review operations, Google/Facebook/Yelp sync, and Negative Feedback Shield without buying an unneeded phone or directory suite.",
        linkHref: "/pricing",
        linkLabel: "View Zyene Reviews plans",
    },
    {
        name: "Birdeye",
        pricing: "Custom quote only (third-party trackers report ~$299–$449/mo per location)",
        summary:
            "An enterprise CX platform bundling reviews with directory listings sync (Google, Apple Maps, Bing, Yelp, Facebook), webchat, surveys, and 3,000+ connectors under one contract.",
        fit: "Choose when you have enterprise budget and need to centrally manage multi-directory listings and customer experience surveys across locations.",
        linkHref: "/compare/birdeye",
        linkLabel: "Compare Zyene vs Birdeye",
    },
    {
        name: "Podium",
        pricing: "Custom quote only (third-party trackers report ~$399+/mo)",
        summary:
            "A customer communication suite combining two-way texting, website chat, VoIP business phones with missed-call text-back, and mobile text-to-pay invoicing.",
        fit: "Choose when your front-office operations run on customer texting, team phone dispatch, and collecting payments by text message.",
        linkHref: "/compare/podium",
        linkLabel: "Compare Zyene vs Podium",
    },
    {
        name: "NiceJob",
        pricing: "Starter $75/mo · Pro $125/mo (USD)",
        summary:
            "Tailored for home-service contractors running Jobber, Housecall Pro, or QuickBooks. Offers automated review invites on job completion, social auto-posting, and a 14-day trial without a card.",
        fit: "Choose when you want direct field-service job triggers and social proof marketing. Note that AI replies and competitor tracking require the $125/mo Pro tier.",
        linkHref: "/compare/nicejob",
        linkLabel: "Compare Zyene vs NiceJob",
    },
    {
        name: "GatherUp",
        pricing: "$99/mo (1 location) · $60/location/mo (2–10 locations)",
        summary:
            "Monitors 100+ review sites, includes customer NPS surveys, and provides up to 3,000 email credits and 300 SMS per location each month. Competitor tracking requires the Review Defense add-on.",
        fit: "Choose when you send heavy monthly email request volumes or need to monitor specialized industry portals beyond Google, Facebook, and Yelp.",
        linkHref: "/compare/gatherup",
        linkLabel: "Compare Zyene vs GatherUp",
    },
];

const ICONS = [Store, Building2, MessageSquare, Briefcase, BarChart3] as const;

export function CompareHubSmallBusinessSection() {
    return (
        <section className="marketing-section" aria-labelledby="small-business-pick-heading">
            <div className="marketing-container mi-split">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Small business guide</p>
                    <h2 id="small-business-pick-heading">Which review platform should a small business pick?</h2>
                    <p>
                        For businesses operating 1–5 locations, enterprise packages often mean quoted contracts,
                        lengthy onboarding, and paying for features you never touch. Here is a practical decision
                        guide matching each platform to your operational model.
                    </p>
                </div>
                <ul className="mi-list">
                    {PLATFORM_GUIDES.map((item, index) => {
                        const Icon = ICONS[index % ICONS.length];
                        return (
                            <li key={item.name}>
                                <Icon size={18} aria-hidden="true" />
                                <div>
                                    <h3>{item.name}</h3>
                                    <p className="mi-card-meta">{item.pricing}</p>
                                    <p>{item.summary}</p>
                                    <p className="mi-list-pick">
                                        <span className="font-semibold">When to choose: </span>
                                        {item.fit}
                                    </p>
                                    <Link href={item.linkHref} className="home-text-link mt-2 inline-flex">
                                        {item.linkLabel} <ArrowRight size={14} aria-hidden="true" />
                                    </Link>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

