// ─────────────────────────────────────────────────────────────────────────────
// Competitor Comparison Data — Phase 3
// Single source of truth for all 4 comparison landing pages.
// ─────────────────────────────────────────────────────────────────────────────

import type { FaqItem } from "@/components/seo/json-ld";

export interface FeatureRow {
    feature: string;
    zyene: string | boolean;
    competitor: string | boolean;
    note?: string;
}

export interface CompetitorData {
    slug: string;
    name: string;
    price: string;
    priceNote: string;
    contractRequired: boolean;
    keyAngle: string;
    heroSub: string;
    metaTitle: string;
    metaDescription: string;
    targetKeywords: string[];
    winsForCompetitor: string[];
    winsForZyene: string[];
    quickTable: FeatureRow[];
    featureBreakdown: FeatureRow[];
    whoShouldUseCompetitor: string[];
    whoShouldUseZyene: string[];
    accentColor: string;
    /** 50–70 word GEO summary: who should pick Zyene vs this competitor. */
    openingSummary?: string;
    faqs?: FaqItem[];
}

export const COMPETITORS: CompetitorData[] = [
    // ── 1. Birdeye ─────────────────────────────────────────────────────────
    {
        slug: "birdeye",
        name: "Birdeye",
        price: "$299",
        priceNote: "Starting price per month, billed annually. Actual pricing varies by location count and contract tier.",
        contractRequired: true,
        keyAngle: "10× cheaper, no annual contract, same AI features",
        heroSub: "See why local businesses are switching from Birdeye to Zyene — and paying $270 less per month to do it.",
        metaTitle: "Zyene Reviews vs Birdeye — Full Comparison 2026",
        metaDescription:
            "Compare Zyene Reviews vs Birdeye: AI replies, Negative Feedback Shield, and pricing from $29.99/mo with no contract versus Birdeye at $299/mo.",
        targetKeywords: ["zyene vs birdeye", "birdeye alternative", "cheaper than birdeye", "birdeye pricing", "birdeye review management alternative"],
        winsForCompetitor: [
            "Better for large enterprise accounts with 50+ locations",
            "Includes webchat, ticketing, and customer surveys in one platform",
            "Dedicated customer success manager on higher tiers",
            "Deeper Salesforce and enterprise CRM integrations",
            "Established brand with 10+ years in the market",
        ],
        winsForZyene: [
            "10× cheaper — $29.99/mo vs $299/mo starting",
            "No annual contract — cancel anytime, month-to-month",
            "Negative Feedback Shield included on all plans (Birdeye does not have this)",
            "Competitor tracking included on all plans (Birdeye only on premium tiers)",
            "Full REST API access on all paid plans (Birdeye: enterprise only)",
            "GBP keyword performance dashboard included",
            "7-day free trial — no credit card lock-in",
        ],
        quickTable: [
            { feature: "Starting price (monthly)", zyene: "$29.99/mo", competitor: "$299/mo" },
            { feature: "Annual contract required", zyene: false, competitor: true },
            { feature: "7-day free trial", zyene: true, competitor: false },
            { feature: "Negative Feedback Shield", zyene: true, competitor: false },
            { feature: "AI reply suggestions (all plans)", zyene: true, competitor: "Add-on / Higher tiers" },
            { feature: "Competitor tracking (all plans)", zyene: true, competitor: "Premium tiers only" },
            { feature: "REST API (all plans)", zyene: true, competitor: "Enterprise only" },
            { feature: "GBP keyword dashboard", zyene: true, competitor: false },
        ],
        featureBreakdown: [
            { feature: "Review monitoring (Google, Facebook, Yelp)", zyene: "All plans, real-time", competitor: "All plans, real-time", note: "Parity" },
            { feature: "AI reply suggestions", zyene: "Unlimited on all plans", competitor: "Add-on cost on most tiers" },
            { feature: "Auto-commenter (hands-free AI replies)", zyene: "All paid plans", competitor: "Not available" },
            { feature: "SMS review requests", zyene: "500–700/mo per location", competitor: "Yes, volume by plan" },
            { feature: "Email review requests", zyene: "500–700/mo per location", competitor: "Yes, volume by plan" },
            { feature: "Negative Feedback Shield", zyene: "All plans", competitor: "Not available" },
            { feature: "Competitor tracking", zyene: "All plans, up to 10 per location", competitor: "Premium tiers only" },
            { feature: "GBP keyword performance dashboard", zyene: "All plans", competitor: "Limited / Not included" },
            { feature: "REST API", zyene: "All paid plans", competitor: "Enterprise plans only" },
            { feature: "Embeddable review widgets", zyene: "All paid plans", competitor: "Available" },
            { feature: "Zapier integration", zyene: "All plans", competitor: "Available" },
            { feature: "Team members (Starter)", zyene: "Up to 5", competitor: "Varies by tier" },
            { feature: "Annual contract required", zyene: "No — month-to-month", competitor: "Yes — annual commitment" },
            { feature: "Free trial", zyene: "7 days, full access", competitor: "Demo only" },
            { feature: "Webchat & ticketing platform", zyene: "Not included (reviews focus)", competitor: "Yes — full platform" },
            { feature: "Dedicated success manager", zyene: "Not included (self-serve)", competitor: "Higher tiers" },
        ],
        whoShouldUseCompetitor: [
            "Enterprise chains with 50+ locations needing a unified CX platform",
            "Businesses that need webchat, ticketing, and surveys in one tool",
            "Companies with Salesforce or enterprise CRM requiring deep integration",
            "Organizations with a dedicated marketing/IT team to manage the platform",
        ],
        whoShouldUseZyene: [
            "Owner-operators and small business owners who want to focus on reviews, not a full CX platform",
            "Single-location or 2–3 location businesses — Starter at $29.99/mo, Professional at $59.99/mo",
            "Businesses that can't commit to annual contracts or expensive per-location pricing",
            "Anyone who wants the Negative Feedback Shield to protect their Google rating",
            "Developers who need API access without enterprise pricing",
        ],
        openingSummary:
            "Pick Zyene if you run one to a few locations and want review monitoring, AI replies, Negative Feedback Shield, and API access without a $299/mo annual contract. Birdeye fits better when you need enterprise CX—webchat, ticketing, surveys, and deep Salesforce-style integrations across many locations. Figures below use published list positioning; your Birdeye quote may vary by location count.",
        faqs: [
            {
                question: "Is Zyene really cheaper than Birdeye?",
                answer:
                    "On published starting prices, yes: Zyene Starter is $29.99/mo month-to-month versus Birdeye’s commonly cited $299/mo entry with annual billing. Your actual Birdeye invoice depends on locations and tier—always confirm with Birdeye sales.",
            },
            {
                question: "Does Birdeye include Negative Feedback Shield?",
                answer:
                    "Birdeye does not offer Zyene’s Negative Feedback Shield—a private routing step before unhappy customers post publicly. Birdeye focuses on collection, monitoring, and broader CX workflows instead.",
            },
            {
                question: "Who should stay on Birdeye instead of switching?",
                answer:
                    "Multi-location enterprises that need webchat, ticketing, customer surveys, dedicated success managers, and deep CRM integrations in one platform. If reviews are one piece of a larger CX stack, Birdeye may still be the better fit.",
            },
            {
                question: "Can I get API access on Zyene without enterprise pricing?",
                answer:
                    "Yes. Zyene includes REST API access on all paid plans. Birdeye typically limits full API access to enterprise tiers—check your contract if integrations are non-negotiable.",
            },
            {
                question: "Do both tools monitor Google, Facebook, and Yelp reviews?",
                answer:
                    "Both monitor major review sites in real time on their respective plans. Zyene adds auto-commenter, competitor tracking, and GBP keyword dashboards on standard paid plans—features Birdeye often reserves for higher tiers or add-ons.",
            },
        ],
        accentColor: "blue",
    },

    // ── 2. Podium ──────────────────────────────────────────────────────────
    {
        slug: "podium",
        name: "Podium",
        price: "$399",
        priceNote: "Starting price per month, billed annually. Pricing varies by location and features selected.",
        contractRequired: true,
        keyAngle: "Reviews-focused vs messaging platform — and 13× cheaper",
        heroSub: "Podium is a messaging and payments platform. Zyene is a review management platform. See the full difference — and why Zyene costs 13× less.",
        metaTitle: "Zyene Reviews vs Podium — Full Comparison 2026",
        metaDescription:
            "Zyene Reviews vs Podium: review management, AI replies, and Shield at $29.99/mo with no contract compared to Podium at $399/mo.",
        targetKeywords: ["zyene vs podium", "podium alternative", "cheaper than podium", "podium pricing", "podium review management alternative"],
        winsForCompetitor: [
            "Full messaging platform: SMS inbox, webchat, and two-way customer messaging",
            "Integrated payments and invoicing via text",
            "Podium Phones for inbound call tracking and recording",
            "Better fit for businesses that want a unified communications hub",
            "Large support team and extensive onboarding resources",
        ],
        winsForZyene: [
            "13× cheaper — $29.99/mo vs $399/mo starting",
            "No annual contract — cancel anytime",
            "Purpose-built for review management — not a messaging add-on",
            "Negative Feedback Shield (Podium does not have this)",
            "Competitor tracking on all plans (Podium: not available)",
            "GBP keyword performance dashboard",
            "Full API access on all paid plans",
            "7-day free trial with no credit card lock-in",
        ],
        quickTable: [
            { feature: "Starting price (monthly)", zyene: "$29.99/mo", competitor: "$399/mo" },
            { feature: "Annual contract required", zyene: false, competitor: true },
            { feature: "7-day free trial", zyene: true, competitor: false },
            { feature: "Primary focus", zyene: "Review management", competitor: "Messaging & payments" },
            { feature: "Negative Feedback Shield", zyene: true, competitor: false },
            { feature: "Competitor tracking", zyene: true, competitor: false },
            { feature: "AI reply suggestions", zyene: "All plans, unlimited", competitor: "Basic / Add-on" },
            { feature: "GBP keyword dashboard", zyene: true, competitor: false },
            { feature: "Two-way SMS messaging", zyene: false, competitor: true },
            { feature: "Payments via text", zyene: false, competitor: true },
        ],
        featureBreakdown: [
            { feature: "Google review monitoring", zyene: "Real-time, all plans", competitor: "Available" },
            { feature: "Facebook & Yelp reviews", zyene: "All plans", competitor: "Available" },
            { feature: "AI reply suggestions", zyene: "Unlimited, all plans", competitor: "Basic — primarily for getting reviews" },
            { feature: "Auto-commenter", zyene: "All paid plans", competitor: "Not available" },
            { feature: "Negative Feedback Shield", zyene: "All plans", competitor: "Not available" },
            { feature: "Competitor tracking", zyene: "All plans, up to 10", competitor: "Not available" },
            { feature: "GBP keyword dashboard", zyene: "All plans", competitor: "Not available" },
            { feature: "SMS review requests", zyene: "500–700/mo per location", competitor: "Yes" },
            { feature: "Two-way SMS messaging inbox", zyene: "Not included", competitor: "Core feature" },
            { feature: "Payments via text message", zyene: "Not included", competitor: "Core feature" },
            { feature: "REST API", zyene: "All paid plans", competitor: "Limited" },
            { feature: "Annual contract required", zyene: "No", competitor: "Yes" },
            { feature: "Free trial", zyene: "7 days, full access", competitor: "Demo only" },
        ],
        whoShouldUseCompetitor: [
            "Businesses that need a full customer communications hub: messaging, payments, and reviews in one",
            "Auto dealerships or home services companies with high incoming call and text volume",
            "Businesses with a dedicated customer success team to manage a complex platform",
        ],
        whoShouldUseZyene: [
            "Local businesses that primarily need to manage and grow their Google reviews",
            "Owner-operators who want a purpose-built review tool without paying for messaging/payments they won't use",
            "Single or multi-location businesses that need the Negative Feedback Shield",
            "Anyone who can't commit to a $399/mo annual contract",
        ],
        openingSummary:
            "Choose Zyene when Google review growth, AI replies, competitor tracking, and Negative Feedback Shield are the core job—not a unified SMS inbox and payments platform. Podium wins for shops that live in two-way texting, webchat, and pay-by-text workflows. Published entry pricing is roughly $29.99/mo month-to-month for Zyene versus about $399/mo with annual billing for Podium—confirm quotes for your location count.",
        faqs: [
            {
                question: "Is Podium primarily a review management tool?",
                answer:
                    "Podium is a customer communications platform—SMS inbox, webchat, payments, and phones—with review features attached. Zyene is purpose-built for monitoring, replying to, and growing Google reviews without paying for messaging you may not use.",
            },
            {
                question: "Does Podium offer competitor tracking or a GBP keyword dashboard?",
                answer:
                    "Podium does not include Zyene’s competitor tracking or GBP keyword performance dashboard on standard positioning. If local SEO benchmarking matters, compare feature lists side by side before signing an annual Podium contract.",
            },
            {
                question: "When is Podium the better choice?",
                answer:
                    "Choose Podium if two-way SMS, webchat, and text-to-pay are daily workflows—common in auto, home services, and high-volume inbound text businesses. You need staff to run that communications hub.",
            },
            {
                question: "Can Zyene replace Podium’s messaging inbox?",
                answer:
                    "No. Zyene sends SMS and email review requests but does not replace a full two-way messaging inbox or payments product. Many owners use Zyene alongside their existing texting stack—or switch from Podium when reviews, not payments, drove the spend.",
            },
            {
                question: "How do free trials compare?",
                answer:
                    "Zyene offers a 7-day free trial with full paid-plan access during the trial window. Podium is typically sold via demo and annual contract—verify current trial terms with Podium before you commit.",
            },
        ],
        accentColor: "purple",
    },

    // ── 3. NiceJob ────────────────────────────────────────────────────────
    {
        slug: "nicejob",
        name: "NiceJob",
        price: "$75",
        priceNote: "Starting price per month on the Grow plan (1 location). The Convert plan (with website) adds ~$100/mo.",
        contractRequired: false,
        keyAngle: "More features, better AI, at a comparable or lower price",
        heroSub: "NiceJob focuses on automated review collection. Zyene adds AI replies, competitor tracking, GBP SEO, and the Negative Feedback Shield — at a similar price.",
        metaTitle: "Zyene Reviews vs NiceJob — Full Comparison 2026",
        metaDescription:
            "Zyene Reviews vs NiceJob: AI replies, competitor tracking, GBP keywords, and Negative Feedback Shield — compare at $29.99/mo.",
        targetKeywords: ["zyene vs nicejob", "nicejob alternative", "nicejob competitor", "nicejob pricing comparison", "better than nicejob"],
        winsForCompetitor: [
            "Simpler, more visual interface — easier for non-technical owners",
            "Includes a basic website builder on the Convert plan",
            "Video testimonial collection",
            "Longer track record in the home services and trades vertical",
            "Slightly larger integration marketplace",
        ],
        winsForZyene: [
            "AI reply suggestions on every review (NiceJob has no AI reply feature)",
            "Auto-commenter: hands-free AI replies (not available in NiceJob)",
            "Competitor tracking: monitor up to 10 competitors (not in NiceJob)",
            "GBP keyword performance dashboard (not in NiceJob)",
            "Full REST API on all paid plans (not in NiceJob standard plans)",
            "Negative Feedback Shield included (NiceJob has a similar concept but more limited)",
            "Lower entry price: $29.99/mo vs $75/mo",
        ],
        quickTable: [
            { feature: "Starting price (monthly)", zyene: "$29.99/mo", competitor: "$75/mo" },
            { feature: "Annual contract required", zyene: false, competitor: false },
            { feature: "7-day free trial", zyene: true, competitor: "14-day trial" },
            { feature: "AI reply suggestions", zyene: "Unlimited, all plans", competitor: "Not available" },
            { feature: "Auto-commenter", zyene: "All paid plans", competitor: "Not available" },
            { feature: "Competitor tracking", zyene: "All plans, up to 10", competitor: "Not available" },
            { feature: "GBP keyword dashboard", zyene: "All plans", competitor: "Not available" },
            { feature: "REST API", zyene: "All paid plans", competitor: "Not available (standard)" },
            { feature: "Negative Feedback Shield", zyene: "All plans", competitor: "Basic review filtering" },
            { feature: "Website builder", zyene: false, competitor: "Convert plan only (+$100)" },
        ],
        featureBreakdown: [
            { feature: "Google review monitoring", zyene: "Real-time, all plans", competitor: "Available" },
            { feature: "SMS review requests", zyene: "500–700/mo per location", competitor: "Available" },
            { feature: "Email review requests", zyene: "500–700/mo per location", competitor: "Available" },
            { feature: "AI reply suggestions", zyene: "Unlimited, one-click", competitor: "Not available" },
            { feature: "Auto-commenter (hands-free replies)", zyene: "All paid plans", competitor: "Not available" },
            { feature: "Negative Feedback Shield", zyene: "Full private routing", competitor: "Basic review filtering" },
            { feature: "Competitor tracking", zyene: "Up to 10 per location", competitor: "Not available" },
            { feature: "GBP keyword performance", zyene: "Dashboard, all plans", competitor: "Not available" },
            { feature: "Video testimonials", zyene: "Not included", competitor: "Available" },
            { feature: "Website builder", zyene: "Not included", competitor: "Convert plan" },
            { feature: "REST API", zyene: "All paid plans", competitor: "Not in standard plans" },
            { feature: "Zapier integration", zyene: "All plans", competitor: "Available" },
            { feature: "Embeddable review widgets", zyene: "All paid plans", competitor: "Available" },
        ],
        whoShouldUseCompetitor: [
            "Home services businesses that want a basic review collection tool with a simple UI",
            "Businesses that want video testimonials as part of their marketing",
            "Businesses that want a website included with their subscription",
        ],
        whoShouldUseZyene: [
            "Businesses that want AI reply suggestions and auto-commenter (not in NiceJob)",
            "Businesses that need competitor tracking — a key differentiator",
            "Anyone who wants GBP keyword insights and local SEO tools",
            "Developers who need API access on standard plans",
            "Businesses on a tight budget: $29.99/mo vs $75/mo",
        ],
        accentColor: "green",
    },

    // ── 4. GatherUp ──────────────────────────────────────────────────────
    {
        slug: "gatherup",
        name: "GatherUp",
        price: "$99",
        priceNote: "Starting price per month for 1 location. Pricing scales with location count.",
        contractRequired: false,
        keyAngle: "AI replies, competitor tracking, and GBP SEO at a lower price",
        heroSub: "GatherUp focuses on review collection and customer surveys. Zyene adds AI replies, competitor tracking, and GBP SEO — at a lower starting price.",
        metaTitle: "Zyene Reviews vs GatherUp — Full Comparison 2026",
        metaDescription:
            "Zyene Reviews vs GatherUp: feature and pricing comparison. AI replies, competitor tracking, and Shield at $29.99/mo vs GatherUp at $99/mo.",
        targetKeywords: ["zyene vs gatherup", "gatherup alternative", "gatherup competitor", "gatherup pricing comparison", "better than gatherup"],
        winsForCompetitor: [
            "Strong customer survey and NPS tools beyond just reviews",
            "Employee recognition and internal feedback features",
            "Broader third-party review site coverage (Healthgrades, TripAdvisor, etc.)",
            "Established relationships with healthcare and franchise verticals",
            "White-label options for agencies",
        ],
        winsForZyene: [
            "Lower starting price: $29.99/mo vs $99/mo per location",
            "AI reply suggestions on every review (GatherUp has limited AI features)",
            "Auto-commenter: hands-free AI replies (not in GatherUp)",
            "Competitor tracking: monitor up to 10 competitors (not in GatherUp)",
            "GBP keyword performance dashboard (not in GatherUp)",
            "Negative Feedback Shield for pre-emptive private resolution",
            "7-day free trial with full access",
        ],
        quickTable: [
            { feature: "Starting price (monthly)", zyene: "$29.99/mo", competitor: "$99/mo per location" },
            { feature: "Annual contract required", zyene: false, competitor: false },
            { feature: "7-day free trial", zyene: true, competitor: "14-day trial" },
            { feature: "AI reply suggestions", zyene: "Unlimited, all plans", competitor: "Limited" },
            { feature: "Auto-commenter", zyene: "All paid plans", competitor: "Not available" },
            { feature: "Competitor tracking", zyene: "All plans", competitor: "Not available" },
            { feature: "GBP keyword dashboard", zyene: "All plans", competitor: "Not available" },
            { feature: "Customer surveys / NPS", zyene: "Not included", competitor: "Core feature" },
            { feature: "Employee recognition", zyene: "Not included", competitor: "Available" },
            { feature: "Negative Feedback Shield", zyene: "Full routing", competitor: "Basic" },
        ],
        featureBreakdown: [
            { feature: "Google review monitoring", zyene: "Real-time, all plans", competitor: "Available" },
            { feature: "SMS & email review requests", zyene: "500–700/mo per location", competitor: "Available" },
            { feature: "AI reply suggestions", zyene: "Unlimited, one-click", competitor: "Limited / basic" },
            { feature: "Auto-commenter (hands-free replies)", zyene: "All paid plans", competitor: "Not available" },
            { feature: "Negative Feedback Shield", zyene: "Full private routing, all plans", competitor: "Basic filtering" },
            { feature: "Competitor tracking", zyene: "Up to 10 per location", competitor: "Not available" },
            { feature: "GBP keyword performance", zyene: "Dashboard, all plans", competitor: "Not available" },
            { feature: "Customer surveys / NPS", zyene: "Not included", competitor: "Core feature" },
            { feature: "Employee recognition", zyene: "Not included", competitor: "Available" },
            { feature: "White-label for agencies", zyene: "Not included", competitor: "Available" },
            { feature: "Healthgrades / TripAdvisor", zyene: "Not synced", competitor: "Available" },
            { feature: "REST API", zyene: "All paid plans", competitor: "Available" },
            { feature: "Zapier integration", zyene: "All plans", competitor: "Available" },
        ],
        whoShouldUseCompetitor: [
            "Businesses that need NPS and customer surveys beyond just reviews",
            "Healthcare practices needing Healthgrades integration",
            "Agencies offering white-label reputation management services",
            "Multi-location franchises needing employee recognition tools",
        ],
        whoShouldUseZyene: [
            "Businesses focused on Google review growth and management",
            "Anyone who wants AI reply suggestions and auto-commenter",
            "Businesses that need competitor tracking to stay ahead locally",
            "GBP-focused businesses wanting keyword performance data",
            "Anyone looking for a lower per-location starting price",
        ],
        accentColor: "orange",
    },
];

/** Lookup map keyed by slug. */
export const COMPETITOR_MAP: Record<string, CompetitorData> = Object.fromEntries(
    COMPETITORS.map((c) => [c.slug, c])
);

/** All valid competitor slugs for generateStaticParams. */
export const COMPETITOR_SLUGS = COMPETITORS.map((c) => c.slug);
