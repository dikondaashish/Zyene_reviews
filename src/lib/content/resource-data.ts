// ─────────────────────────────────────────────────────────────────────────────
// Resource Guides Data — Phase 4
// 4 comprehensive, long-form guides targeting high-volume keyword clusters.
// ─────────────────────────────────────────────────────────────────────────────

import type { ContentSection } from "./blog-data";
import type { FaqItem } from "@/components/seo/json-ld";
import { reviewRequestTemplatesGuide } from "./resource-review-request-templates";

export interface ResourceGuide {
    slug: string;
    title: string;
    subtitle: string;
    excerpt: string;
    purpose: string;
    lastUpdated: string;
    readMinutes: number;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    tableOfContents: Array<{ anchor: string; label: string }>;
    body: ContentSection[];
    /** 50–70 word GEO summary (template pack, etc.). */
    openingSummary?: string;
    /** Badge in header, e.g. Free Template Pack */
    resourceLabel?: string;
    faqs?: FaqItem[];
    internalLinks?: { label: string; href: string }[];
    /** Visible step-by-step content for HowTo JSON-LD (Priority 6). */
    howToSteps?: { name: string; text: string; url?: string }[];
}

const guide1: ResourceGuide = {
    slug: "google-reviews-guide",
    title: "The Complete Guide to Google Reviews",
    subtitle: "Everything local business owners need to know about Google Reviews in 2026 — collection, responses, ranking, and reputation protection.",
    excerpt: "The definitive guide to Google Reviews for local businesses. Covers collection strategy, response best practices, ranking impact, and protecting your rating.",
    purpose: "Rank for 'google reviews' cluster keywords",
    lastUpdated: "2026-08-15",
    readMinutes: 18,
    metaTitle: "Google Reviews Guide for Local Businesses (2026)",
    metaDescription:
        "The Google Reviews guide for local businesses: collection strategy, response best practices, ranking impact, and reputation protection in one place.",
    keywords: ["google reviews guide", "google reviews for businesses", "how google reviews work", "complete guide to google reviews", "google reviews local business"],
    openingSummary:
        "This guide covers how Google Reviews work for local businesses: why they matter for Maps visibility, when and how to ask customers fairly, how to respond to positive and negative feedback, and how to protect your rating without policy violations. Use it as your reference before automating outreach with review software.",
    internalLinks: [
        { label: "Review collection features", href: "/features/review-collection" },
        { label: "Negative Feedback Shield guide", href: "/blog/negative-feedback-shield" },
        { label: "Free review request templates", href: "/resources/review-request-templates" },
        { label: "Compare review platforms", href: "/compare" },
        { label: "Zyene Reviews pricing", href: "/pricing" },
        { label: "Start free trial", href: "/signup" },
    ],
    faqs: [
        {
            question: "Can I remove a negative Google review?",
            answer:
                "You cannot remove a genuine review yourself. Flag reviews that violate Google policies (spam, fake, offensive content) via the ⋮ menu on the review. If Google removes it, great; if not, respond professionally and keep collecting recent honest reviews to balance your profile.",
        },
        {
            question: "How long does it take for a review to appear?",
            answer:
                "Most reviews show within minutes to a few hours. Google's filters occasionally hold reviews for one to three days. If a customer says they left one but you do not see it, ask them to confirm it appears on their own Google profile.",
        },
        {
            question: "Do Google Reviews affect my website's SEO?",
            answer:
                "Reviews primarily influence local search (Google Maps and the Local 3-Pack), not classic organic rankings for your website. Review schema on your site can still earn star rich snippets in organic results, which may improve click-through.",
        },
        {
            question: "Can I respond to reviews from a mobile device?",
            answer:
                "Yes—via the Google Maps app, Google Business Profile app, or business.google.com. A review management tool like Zyene Reviews lets you monitor Google, Facebook, and Yelp and reply from one inbox.",
        },
        {
            question: "Is it okay to ask customers for Google reviews?",
            answer:
                "Yes, when you ask for honest feedback without incentives, without dictating review text, and without sending links only to happy customers. Ask soon after a positive visit and follow Google's outreach rules.",
        },
    ],
    tableOfContents: [
        { anchor: "what-are-google-reviews", label: "What Are Google Reviews?" },
        { anchor: "why-google-reviews-matter", label: "Why Google Reviews Matter" },
        { anchor: "how-to-get-more", label: "How to Get More Reviews" },
        { anchor: "responding-to-reviews", label: "Responding to Reviews" },
        { anchor: "reviews-and-ranking", label: "Reviews and Local Search Ranking" },
        { anchor: "protecting-your-rating", label: "Protecting Your Rating" },
        { anchor: "tools-and-automation", label: "Tools and Automation" },
        { anchor: "frequently-asked-questions", label: "Frequently Asked Questions" },
    ],
    body: [
        { type: "h2", text: "What Are Google Reviews?" },
        { type: "p", text: "Google Reviews are customer-generated ratings and written testimonials that appear on a business's Google Business Profile — the listing that shows in Google Maps and in local search results. Each review consists of a star rating (1–5 stars) and an optional written comment." },
        { type: "p", text: "Only customers with a Google account can leave reviews, which provides some level of authenticity verification. Businesses can respond to reviews publicly, and those responses are visible to all visitors to the Google Business Profile." },
        { type: "h2", text: "Why Google Reviews Matter" },
        { type: "p", text: "Google Reviews are the most influential source of social proof for local businesses. Unlike paid advertising, review content is created by real customers based on real experiences — which is why consumers trust them as much as personal recommendations from friends." },
        { type: "ul", items: [
            "93% of consumers read online reviews before visiting a local business",
            "Reviews are the #1 factor in Google local (Maps) search ranking",
            "A 1-star increase correlates with 5–9% revenue increase for independent businesses",
            "88% of consumers say they trust online reviews as much as personal recommendations",
            "53% of customers expect businesses to respond to reviews within a week",
        ]},
        { type: "h2", text: "How to Get More Reviews" },
        { type: "h3", text: "The Fundamental Rule: Ask" },
        { type: "p", text: "The most impactful thing you can do to increase your review count is to ask for reviews systematically. 70–80% of customers who have a positive experience will leave a review if asked directly — but most businesses never ask, leaving the vast majority of happy customers silent while the occasional unhappy customer takes the initiative to write a 1-star review." },
        { type: "h3", text: "When to Ask (Timing Is Everything)" },
        { type: "p", text: "Ask within 1–3 hours of a positive interaction. This is when customer satisfaction is highest, the experience is vivid, and the likelihood of a review is greatest. Review requests sent days later see 60–70% lower conversion rates." },
        { type: "h3", text: "How to Ask (Channel and Script)" },
        { type: "table", table: {
            headers: ["Channel", "Best Timing", "Response Rate", "Script Length"],
            rows: [
                ["SMS", "1–2 hrs after visit/purchase", "15–25%", "Under 160 characters"],
                ["Email", "Within 24 hrs", "5–10%", "3–5 sentences"],
                ["QR code (in-person)", "At payment / exit", "Varies", "1 line + QR"],
                ["Automated (post-completion)", "Trigger-based", "12–22%", "2–3 sentences"],
            ],
        }},
        { type: "h3", text: "Google's Rules on Review Collection" },
        { type: "ul", items: [
            "Never offer incentives (discounts, freebies) in exchange for reviews — this violates Google's policies and can result in review removal or GBP suspension.",
            "Never dictate specific review content to customers ('please say X in your review').",
            "Never use review gating: you cannot filter customers to only send review requests to satisfied ones.",
            "Asking customers who are in your premises on your business WiFi is against Google's policies.",
            "You CAN ask all customers to leave honest reviews — positive and negative.",
        ]},
        { type: "h2", text: "Responding to Reviews" },
        { type: "h3", text: "Why Responding Matters" },
        { type: "p", text: "Responding to reviews shows customers that you are engaged and accountable, gives you an opportunity to add context or resolve issues publicly, and follows Google's guidance for helping a Business Profile stand out. Google does not publish response rate as a separate ranking factor." },
        { type: "h3", text: "Best Practices for Positive Review Responses" },
        { type: "ul", items: [
            "Always personalize — mention the reviewer's name and at least one specific detail from their review.",
            "Keep it brief — 2–4 sentences is ideal. Long responses to positive reviews can seem excessive.",
            "Naturally mention your services or location when relevant: 'We're so glad the deep cleaning went well — see you at our Austin office next time!'",
            "Vary your opening phrases. Never use the same opener in consecutive responses.",
        ]},
        { type: "h3", text: "The Framework for Negative Review Responses" },
        { type: "ol", items: [
            "Acknowledge: Recognize the customer's experience without getting defensive.",
            "Apologize: Express regret for the experience not meeting expectations.",
            "Take responsibility (where applicable): Own specific mistakes briefly.",
            "Offer resolution: Provide direct contact information for follow-up.",
            "Close gracefully: Invite them to return or thank them for the feedback.",
        ]},
        { type: "h2", text: "Reviews and Local Search Ranking" },
        { type: "p", text: "Google says review count and positive ratings can help local ranking. Prominence also reflects links, articles, directories, and how well known a business is offline, so reviews are one input rather than a complete ranking formula." },
        { type: "h3", text: "Documented Guidance and Responsible Practice" },
        { type: "ul", items: [
            "Review quantity: Google says more reviews can help local ranking; it publishes no universal threshold.",
            "Review recency: Current feedback helps customers, but Google publishes no ninety-day ranking weight.",
            "Response rate: Helpful replies show that feedback matters; no separate response-rate ranking factor is published.",
            "Average star rating: Google says positive ratings can help local ranking without publishing the weighting formula.",
            "Review detail: Invite honest specifics for customer value, but never dictate wording or promise a keyword-ranking effect.",
        ]},
        { type: "h2", text: "Protecting Your Rating" },
        { type: "h3", text: "The Negative Feedback Shield Approach" },
        { type: "p", text: "The most effective way to protect your Google rating is to intercept unhappy customers before they go to Google. When customers have a complaint, they typically have two options: tell you about it directly, or write a public review. Most choose the path of least resistance — which, in the smartphone era, is a 1-star Google review from the parking lot." },
        { type: "p", text: "A Negative Feedback Shield changes this dynamic by creating a prominent private resolution channel in your review request flow. When a customer indicates they were not satisfied, they're routed to a private form where they can share feedback directly with you — rather than being taken straight to Google's review page." },
        { type: "h3", text: "How to Handle Fake Reviews" },
        { type: "ul", items: [
            "Document the review with screenshots before doing anything.",
            "Flag it using the ⋮ menu next to the review in Google Maps ('Report review' → 'Spam or fake').",
            "Escalate to Google Business Profile support if the flag doesn't result in removal within 7–10 days.",
            "Respond professionally and briefly — don't argue, but signal to readers that the review may not be authentic.",
            "Accelerate legitimate review collection to dilute the fake review's impact.",
        ]},
        { type: "h2", text: "Tools and Automation" },
        { type: "p", text: "Manually managing Google Reviews — monitoring multiple platforms, sending individual requests, writing responses, and tracking competitors — is unsustainable for busy business owners. Review management software automates the repetitive work and ensures nothing falls through the cracks." },
        { type: "p", text: "Key features to look for in a review management tool:" },
        { type: "ul", items: [
            "Real-time review alerts across Google, Facebook, and Yelp",
            "Automated review request delivery via SMS and email",
            "AI reply suggestions for faster, more consistent responses",
            "Negative Feedback Shield for private complaint routing",
            "Competitor tracking to monitor nearby businesses",
            "GBP keyword performance dashboard",
            "Pricing without annual contracts",
        ]},
        { type: "cta", ctaLabel: "Try Zyene Reviews free for 7 days →", ctaHref: "/signup" },
        { type: "h2", text: "Frequently Asked Questions" },
        { type: "h3", text: "Can I remove a negative Google review?" },
        { type: "p", text: "You cannot unilaterally remove a Google review. You can flag it for removal if it violates Google's policies (spam, fake, offensive content). Google then decides whether to remove it. If the review is genuine, the best approach is a professional response and ongoing review collection to dilute its impact." },
        { type: "h3", text: "How long does it take for a review to appear?" },
        { type: "p", text: "Most Google reviews appear within minutes to hours. Occasionally, Google's spam filters hold reviews for review, which can take 1–3 days. If a customer tells you they left a review but you can't see it, ask them to check if it's showing on their own profile." },
        { type: "h3", text: "Do Google Reviews affect my website's SEO?" },
        { type: "p", text: "Google Reviews primarily affect local search rankings (Google Maps / Local 3-Pack) rather than traditional organic website SEO. However, review schema markup on your website can display star ratings in organic search results (rich snippets), which improves click-through rates." },
        { type: "h3", text: "Can I respond to reviews from a mobile device?" },
        { type: "p", text: "Yes. You can respond to reviews through the Google Maps app, the Google Business Profile app, or any browser via business.google.com. Using a review management tool like Zyene lets you monitor and respond from a single dashboard across all platforms." },
    ],
};

const guide2: ResourceGuide = {
    slug: "negative-review-templates",
    title: "Negative Review Response Templates (20+ Ready-to-Use)",
    subtitle: "Copy-paste response templates for every type of negative Google review — organized by complaint category and industry.",
    excerpt: "20+ ready-to-use templates for responding to negative Google reviews. Organized by complaint type: service quality, wait time, billing, staff attitude, and more.",
    purpose: "Rank for 'how to respond to bad reviews' cluster",
    lastUpdated: "2026-05-25",
    readMinutes: 14,
    metaTitle: "20+ Negative Review Response Templates (Google Reviews)",
    metaDescription: "Ready-to-use templates for responding to any negative Google review. 20+ templates organized by complaint type with customization instructions.",
    keywords: ["negative review response templates", "how to respond to bad reviews", "google review response templates", "1 star review response", "bad review templates"],
    openingSummary:
        "Use these 20+ negative review response templates when a Google review needs a calm, professional reply. Each script follows a short framework—acknowledge, apologize where appropriate, invite private resolution—and stays under 150 words. Personalize every response; templates are starting points, not copy-paste spam.",
    internalLinks: [
        { label: "Review collection & Shield", href: "/features/review-collection" },
        { label: "Negative Feedback Shield guide", href: "/blog/negative-feedback-shield" },
        { label: "Complete Google Reviews guide", href: "/resources/google-reviews-guide" },
        { label: "Compare review platforms", href: "/compare" },
        { label: "Zyene Reviews pricing", href: "/pricing" },
        { label: "Start free trial", href: "/signup" },
    ],
    faqs: [
        {
            question: "How long should a negative review response be?",
            answer:
                "Aim for under 150 words. Long replies can read as defensive. Include the customer's name, one specific detail from their review, and a direct way to continue the conversation privately (email or phone).",
        },
        {
            question: "Should I respond to every negative Google review?",
            answer:
                "Yes, when the review is visible and genuine. A thoughtful public response shows future customers you are accountable. For suspected fake reviews, use a neutral template and flag the review to Google.",
        },
        {
            question: "Can I use the same template twice in a row?",
            answer:
                "Avoid repeating identical openers or full scripts on consecutive reviews—readers notice patterns. Swap opening phrases and reference different details from each review even when the complaint category is the same.",
        },
        {
            question: "What if the review seems fake or from someone who never visited?",
            answer:
                "Flag it to Google, respond briefly without arguing, and note that you could not verify the visit in your records. Continue collecting legitimate reviews so one suspicious post has less relative impact.",
        },
        {
            question: "Should I offer a refund or discount in the public reply?",
            answer:
                "Keep specific offers in private follow-up when possible. Public replies should focus on empathy and a direct contact path. Do not tie any incentive to changing or removing a review—that violates platform policies.",
        },
    ],
    tableOfContents: [
        { anchor: "before-you-respond", label: "Before You Respond: 5 Rules" },
        { anchor: "service-quality", label: "Service Quality Complaints" },
        { anchor: "wait-time", label: "Wait Time & Availability" },
        { anchor: "billing-pricing", label: "Billing & Pricing" },
        { anchor: "staff-attitude", label: "Staff Attitude & Communication" },
        { anchor: "product-quality", label: "Product Quality" },
        { anchor: "vague-reviews", label: "Vague or Unverifiable" },
        { anchor: "fake-reviews", label: "Suspected Fake Reviews" },
        { anchor: "customization", label: "How to Customize Templates" },
    ],
    body: [
        { type: "h2", text: "Before You Respond: 5 Non-Negotiable Rules" },
        { type: "ol", items: [
            "Wait before responding to anything that makes you angry. The 24-hour rule: if the review frustrated you, draft your response and re-read it the next day. You'll almost always edit it for the better.",
            "Never argue publicly. Even if the reviewer is factually wrong, a public argument makes you look worse than the review itself.",
            "Always invite private resolution. Every negative review response should include a direct email or phone number and an invitation to continue the conversation privately.",
            "Personalize every response. These are templates, not scripts. Add the reviewer's name, a specific detail from their review, and any relevant context.",
            "Keep it under 150 words. Long responses to negative reviews read as defensive. Brevity signals confidence.",
        ]},
        { type: "h2", text: "Service Quality Complaint Templates" },
        { type: "h3", text: "Template SQ-1: General Service Quality" },
        { type: "quote", text: "Hi [Name], thank you for your honest feedback. We're genuinely sorry your experience didn't reflect the quality we work hard to provide. What you described is not the standard we hold ourselves to, and we've shared your feedback directly with our team. We'd love the opportunity to make this right — please reach out to us at [email] or [phone] and we'll take care of you personally. We hope to see you again." },
        { type: "h3", text: "Template SQ-2: Incomplete or Rushed Service" },
        { type: "quote", text: "Hi [Name], thank you for letting us know about this. We're sorry your visit felt rushed — that's not the experience we want you to have, and I understand your frustration. We've addressed this with the relevant team members. If you'd be willing to give us another chance, please contact us at [email] — we'd like to ensure your next experience reflects what we're truly capable of." },
        { type: "h3", text: "Template SQ-3: Miscommunication About Service Scope" },
        { type: "quote", text: "Hi [Name], we appreciate you sharing this. We're sorry there was a miscommunication about what was included in your service — that's something we should have made clearer upfront. We're reviewing how we communicate our service scope to prevent this for future customers. Please reach out to us at [email] if you'd like to discuss your specific experience further — we value your business." },
        { type: "h2", text: "Wait Time & Availability Templates" },
        { type: "h3", text: "Template WT-1: Excessive Wait Time" },
        { type: "quote", text: "Hi [Name], thank you for this feedback. We sincerely apologize for the wait you experienced — we know your time is valuable and we clearly didn't manage our schedule well that day. We're looking at our staffing and scheduling to address this. If you'd like to give us another opportunity, please call us at [phone] to book directly — we'll make sure you're prioritized. Thank you for your patience." },
        { type: "h3", text: "Template WT-2: Couldn't Get an Appointment" },
        { type: "quote", text: "Hi [Name], we're so sorry you had trouble getting an appointment. We've been experiencing high demand, and we clearly haven't done enough to accommodate everyone who wants to see us. We're working to expand our availability. Please reach out to us at [email] or [phone] — we'll personally help find a time that works for you." },
        { type: "h2", text: "Billing & Pricing Templates" },
        { type: "h3", text: "Template BP-1: Unexpected Charges" },
        { type: "quote", text: "Hi [Name], thank you for bringing this to our attention. We're sorry you were surprised by the charges on your bill — that's not the experience we want our customers to have, and clearer upfront communication is something we're actively improving. Please reach out to us at [email] or call [phone] and ask for [manager name]. We'll review your account personally and make sure you feel treated fairly." },
        { type: "h3", text: "Template BP-2: Price vs. Value Complaint" },
        { type: "quote", text: "Hi [Name], we appreciate your honest feedback. We understand that value is personal, and we're sorry the experience didn't feel worth the price for you. We take pricing feedback seriously as we think about how to better communicate what's included. If there's anything specific we could have done differently, we'd love to hear more — please reach out at [email]. Thank you." },
        { type: "h3", text: "Template BP-3: Billing Error" },
        { type: "quote", text: "Hi [Name], thank you for letting us know about this. Billing errors should simply not happen, and we're genuinely sorry this was your experience. Please contact us immediately at [email] or [phone] and ask for [name] — we'll review your account, correct any error, and make sure this is fully resolved. This has our full attention." },
        { type: "h2", text: "Staff Attitude & Communication Templates" },
        { type: "h3", text: "Template SA-1: Rude or Dismissive Staff" },
        { type: "quote", text: "Hi [Name], thank you for taking the time to share this. We're very sorry about the interaction you experienced — this falls far below the respectful, professional standard we hold our entire team to. I've shared your feedback directly with our management team and it will be addressed. We'd appreciate the chance to restore your confidence in us — please reach out at [email]. Thank you for holding us accountable." },
        { type: "h3", text: "Template SA-2: Communication Failure" },
        { type: "quote", text: "Hi [Name], thank you for this feedback. We're sorry that communication about [the issue] wasn't clear — we should have been more proactive in keeping you informed. That's a process gap we're actively working to close. If you'd be willing to discuss this further, please reach out at [email] — we'd like to understand your experience in more detail and do better." },
        { type: "h2", text: "Product Quality Templates" },
        { type: "h3", text: "Template PQ-1: Product Quality Below Expectations" },
        { type: "quote", text: "Hi [Name], thank you for your honest feedback. We're disappointed to hear the [product] didn't meet your expectations — that's not the standard we hold ourselves to. We'd like to understand more about your specific experience. Please reach out to us at [email] and we'll make this right. Your feedback also helps us improve for every customer who comes after you." },
        { type: "h3", text: "Template PQ-2: Damaged or Incorrect Product" },
        { type: "quote", text: "Hi [Name], we sincerely apologize for this. Receiving a damaged or incorrect [product] is completely unacceptable, and we want to fix this right away. Please contact us at [email] or [phone] with your order details and we'll send a replacement and/or process a refund — no questions asked. Thank you for letting us know." },
        { type: "h2", text: "Vague or Unverifiable Review Templates" },
        { type: "h3", text: "Template VU-1: Minimal Information" },
        { type: "quote", text: "Hi [Name], we're sorry to see you had a disappointing experience. We'd genuinely like to understand what happened so we can make it right. Please reach out to us at [email] — we'd love to speak with you directly and address your concerns properly. Thank you for taking the time to share your experience." },
        { type: "h3", text: "Template VU-2: No Record of Visit" },
        { type: "quote", text: "Hi [Name], thank you for the feedback. We're sorry to hear about your experience — however, we're having difficulty matching your visit with our records so we can address it properly. If you've had a genuine issue, we sincerely want to resolve it. Please reach out to us at [email] with any details you can share about your visit so we can look into this further." },
        { type: "h2", text: "Suspected Fake Review Templates" },
        { type: "h3", text: "Template FR-1: Suspected Fake (Neutral Tone)" },
        { type: "quote", text: "Thank you for the feedback. We've reviewed our records and are unable to verify this visit. If you're a real customer who had a genuine concern, we sincerely want to hear from you — please reach out to us directly at [email] with your visit details. We take all feedback seriously and are investigating this review further." },
        { type: "h2", text: "How to Customize These Templates" },
        { type: "ol", items: [
            "Replace all [bracketed] placeholders with real information: reviewer's name, your email, manager name, relevant product/service details.",
            "Add 1 specific detail from the review: mention the exact issue they raised in their specific language to show you actually read it.",
            "Adjust the tone to match your brand: a family-owned restaurant can be warmer; a healthcare practice should be more formal.",
            "Never use the same template twice in a row: vary your opening phrase at minimum. Readers can spot template patterns.",
            "Read it out loud before publishing: if anything sounds robotic, defensive, or insincere — edit it.",
        ]},
        { type: "tip", text: "Zyene's AI reply feature generates customized response drafts for every review — positive and negative — that you then personalize before publishing. It uses the structure of these templates as a foundation and adapts the language to each specific review." },
        { type: "cta", ctaLabel: "Try AI-powered review replies with Zyene →", ctaHref: "/signup" },
    ],
};

const guide3: ResourceGuide = {
    slug: "local-seo-checklist",
    title: "Local SEO Checklist for 2026 (40+ Action Items)",
    subtitle: "The complete local SEO checklist for local business owners — Google Business Profile, citations, reviews, on-page optimization, and more.",
    excerpt: "The complete 2026 local SEO checklist. 40+ action items across Google Business Profile, citations, reviews, on-page optimization, and link building — all for local businesses.",
    purpose: "Rank for 'local SEO checklist' and 'local SEO 2026' clusters",
    lastUpdated: "2026-05-25",
    readMinutes: 16,
    metaTitle: "Local SEO Checklist for 2026 (40+ Action Items)",
    metaDescription:
        "Local SEO checklist for 2026: 40+ action items for Google Business Profile, citations, reviews, on-page SEO, and links—built for local business owners.",
    keywords: ["local seo checklist", "local seo checklist 2026", "local business seo checklist", "google local seo", "local seo guide 2026"],
    resourceLabel: "Free Checklist",
    openingSummary:
        "Work through this local SEO checklist section by section: Google Business Profile, citations and NAP, reviews, on-page website basics, local links, mobile speed, schema, and tracking. Check items off as you go; pair review velocity with fair outreach and compliant review requests.",
    internalLinks: [
        { label: "Review collection features", href: "/features/review-collection" },
        { label: "Google Reviews guide", href: "/resources/google-reviews-guide" },
        { label: "Review request templates", href: "/resources/review-request-templates" },
        { label: "Compare review platforms", href: "/compare" },
        { label: "Zyene Reviews pricing", href: "/pricing" },
        { label: "Start free trial", href: "/signup" },
    ],
    faqs: [
        {
            question: "What is local SEO for a small business?",
            answer:
                "Local SEO is optimizing your online presence so you show up when nearby customers search on Google Maps and local results. It combines your Google Business Profile, consistent business listings, reviews, location-focused website pages, and local trust signals.",
        },
        {
            question: "How often should I update my Google Business Profile?",
            answer:
                "Review hours, photos, and services at least monthly. Post weekly Google updates when possible, respond to new reviews within 48 hours, and refresh photos seasonally so your profile looks active.",
        },
        {
            question: "How many Google reviews do I need for local SEO?",
            answer:
                "There is no fixed number—competitive categories often need dozens to hundreds of reviews with steady recency. Focus on consistent monthly collection and owner responses rather than a one-time push.",
        },
        {
            question: "Does NAP consistency still matter in 2026?",
            answer:
                "Yes. Your name, address, and phone should match across your website, Google Business Profile, Yelp, Facebook, and major directories. Inconsistent listings confuse search engines and customers.",
        },
        {
            question: "What is the fastest local SEO win on this checklist?",
            answer:
                "Completing and verifying your Google Business Profile—categories, services, photos, hours, and Q&A—often delivers the quickest visibility lift before you tackle citations and link building.",
        },
    ],
    howToSteps: [
        {
            name: "Complete your Google Business Profile",
            text: "Verify ownership, choose accurate primary and secondary categories, add services, photos, hours, and a keyword-aware business description without stuffing or links.",
        },
        {
            name: "Fix NAP and core citations",
            text: "Align name, address, and phone on your website, GBP, Yelp, Facebook, Apple Maps, and Bing Places; correct outdated listings.",
        },
        {
            name: "Set up review collection and responses",
            text: "Ask customers fairly after visits, respond to every review within 48 hours, and use private feedback channels to resolve issues—not to block honest public reviews.",
        },
        {
            name: "Optimize location pages on your website",
            text: "Add city and service keywords to title tags, H1s, and on-page copy; include NAP in text, embed a map, and build dedicated service pages.",
        },
        {
            name: "Track results weekly",
            text: "Monitor GBP Insights, Search Console local queries, and rank checks for your top keywords; adjust based on what drives calls and direction requests.",
        },
    ],
    tableOfContents: [
        { anchor: "google-business-profile", label: "Google Business Profile" },
        { anchor: "nap-citations", label: "NAP Consistency & Citations" },
        { anchor: "reviews", label: "Reviews" },
        { anchor: "on-page-seo", label: "On-Page Website Optimization" },
        { anchor: "local-link-building", label: "Local Link Building" },
        { anchor: "mobile-and-speed", label: "Mobile & Page Speed" },
        { anchor: "schema-markup", label: "Schema Markup" },
        { anchor: "social-signals", label: "Social Signals" },
        { anchor: "tracking", label: "Tracking Your Results" },
    ],
    body: [
        { type: "h2", text: "Section 1: Google Business Profile Optimization" },
        { type: "p", text: "Your Google Business Profile is the foundation of local SEO. Complete and active GBPs consistently outrank incomplete ones — regardless of competition." },
        { type: "ul", items: [
            "☐ Business name: Exact legal/operating name — no keyword stuffing",
            "☐ Primary category: Most specific category that accurately describes your primary service",
            "☐ Additional categories: Up to 9 secondary categories for related services",
            "☐ Complete address verified and consistent with your website",
            "☐ Local phone number (not a 1-800 number) as primary",
            "☐ Website URL pointing to a location-specific page (not just homepage for multi-location)",
            "☐ Business hours: Regular, holiday, and special hours all accurate",
            "☐ Service area defined (if applicable)",
            "☐ Business description: 750 characters, keyword-rich, no links",
            "☐ Services: Every service listed with individual descriptions",
            "☐ Photos: 30+ photos including exterior, interior, team, and product/service",
            "☐ Cover photo updated within last 12 months",
            "☐ Attributes: All relevant identity, accessibility, and amenity attributes selected",
            "☐ Q&A: 5+ frequently asked questions seeded and answered",
            "☐ Google Posts: At least 1 new post per week",
            "☐ Reviews response rate: 100% of reviews responded to within 48 hours",
        ]},
        { type: "h2", text: "Section 2: NAP Consistency & Citations" },
        { type: "p", text: "NAP (Name, Address, Phone) consistency across the web is a foundational local SEO signal. Inconsistent citations — your name spelled differently, old addresses, wrong phone numbers — confuse Google and dilute your Prominence score." },
        { type: "ul", items: [
            "☐ NAP is identical across your website, GBP, Yelp, Facebook, and all major directories",
            "☐ Yelp profile: Complete with photos, hours, and responding to reviews",
            "☐ Facebook Business Page: Complete, active, and consistent NAP",
            "☐ Apple Maps: Claim and optimize your listing",
            "☐ Bing Places: Create or claim and optimize",
            "☐ Industry directories: Listed in relevant vertical directories (Healthgrades for healthcare, TripAdvisor for hospitality, Houzz for home services, etc.)",
            "☐ Chamber of Commerce: Listed in local chamber directory",
            "☐ BBB: Claimed and active profile (if applicable)",
            "☐ Data aggregators: Ensure accurate data in Factual, Infogroup, and Acxiom",
            "☐ Old citations with wrong address/phone: Identified and corrected",
        ]},
        { type: "h2", text: "Section 3: Reviews" },
        {
            type: "warning",
            text: "Review outreach compliance: Ask customers honestly for feedback. Do not offer incentives tied to star ratings, do not send review links only to happy customers (review gating), and do not pressure people with repeated messages. Use private feedback to resolve issues—not to block legitimate public criticism.",
        },
        { type: "ul", items: [
            "☐ Google review count: 50+ (competitive minimum), 100+ (preferred)",
            "☐ Review velocity: 5–10 new reviews per month minimum",
            "☐ Average rating: 4.0+ (4.4+ preferred for competitive categories)",
            "☐ Review response rate: 100% of reviews responded to",
            "☐ Review response time: Under 48 hours for all, under 24 hours for negative",
            "☐ Review request automation: Systematic process to ask every customer",
            "☐ Multi-platform monitoring: Google, Yelp, Facebook, industry platforms all monitored",
            "☐ Negative Feedback Shield or equivalent: Private resolution channel in place",
            "☐ Fake review monitoring: New reviews checked for authenticity on arrival",
        ]},
        { type: "h2", text: "Section 4: On-Page Website Optimization" },
        { type: "ul", items: [
            "☐ Title tag: City + primary keyword + business name (e.g., 'Austin Family Dentist | Bright Smiles Dental')",
            "☐ Meta description: 150–160 characters, includes city and primary keyword",
            "☐ H1 tag: Contains primary keyword and city",
            "☐ Content: 500+ words on homepage mentioning city, neighborhood, and primary services",
            "☐ NAP on website: Name, address, and phone number in text (not just image) on homepage footer and contact page",
            "☐ Embedded Google Map: Interactive map on contact/location page",
            "☐ Location pages: Separate, unique page for each physical location (multi-location)",
            "☐ Service pages: Individual pages for each primary service (not one page listing all services)",
            "☐ Internal linking: Location and service pages linked from homepage and each other",
            "☐ URL structure: Location and service keywords in URLs (e.g., /austin-family-dentist/)",
        ]},
        { type: "h2", text: "Section 5: Local Link Building" },
        { type: "ul", items: [
            "☐ Local news sites: Get mentioned or featured in local news coverage",
            "☐ Chamber of Commerce: Member and listed on their website with a link",
            "☐ Local business associations: Member with website link",
            "☐ Sponsorships: Local event or team sponsorships that include a website link",
            "☐ Partner businesses: Reciprocal links with complementary local businesses",
            "☐ Local blog features: Guest posts or features on local lifestyle/business blogs",
            "☐ Press releases: Syndicated for new location openings, awards, community events",
        ]},
        { type: "h2", text: "Section 6: Mobile & Page Speed" },
        { type: "ul", items: [
            "☐ Mobile-responsive design: Passes Google's Mobile-Friendly Test",
            "☐ Core Web Vitals: LCP under 2.5s, FID under 100ms, CLS under 0.1 (check in Google Search Console)",
            "☐ Click-to-call: Phone number is a tappable tel: link on mobile",
            "☐ Maps integration: Google Maps directions link is tap-friendly on mobile",
            "☐ Forms: Contact and booking forms work correctly on all mobile devices",
            "☐ Page speed: Homepage loads in under 3 seconds on mobile (4G connection)",
        ]},
        { type: "h2", text: "Section 7: Schema Markup" },
        { type: "ul", items: [
            "☐ LocalBusiness schema: Implemented on homepage/location pages with name, address, phone, hours, coordinates",
            "☐ Organization schema: Implemented on homepage",
            "☐ Review schema: If you display reviews on your website, mark them up with Review schema for rich snippets",
            "☐ FAQPage schema: For any FAQ sections on your site (drives FAQ rich snippets in search results)",
            "☐ Service schema: For individual service pages",
            "☐ Schema validation: Tested using Google's Rich Results Test",
        ]},
        { type: "h2", text: "Section 8: Tracking Your Results" },
        { type: "ul", items: [
            "☐ Google Business Profile Insights: Review weekly — impressions, direction requests, calls, website clicks",
            "☐ GBP keyword performance: What searches are driving views (Zyene dashboard or Google Search Console with local filter)",
            "☐ Google Search Console: Local keyword rankings and click-through rates",
            "☐ Google Analytics 4: Track conversions from local organic traffic (calls, form submissions, bookings)",
            "☐ Local rank tracking: Weekly check of your ranking for top 5–10 target keywords in your city",
        ]},
        { type: "tip", text: "Zyene's GBP keyword performance dashboard shows you which search queries are driving impressions and clicks to your Google Business Profile — data that's hard to extract from Google's native tools alone." },
        { type: "cta", ctaLabel: "Track your local SEO performance with Zyene →", ctaHref: "/features" },
    ],
};

export const RESOURCE_GUIDES: ResourceGuide[] = [guide1, guide2, guide3, reviewRequestTemplatesGuide];

export const RESOURCE_MAP: Record<string, ResourceGuide> = Object.fromEntries(
    RESOURCE_GUIDES.map((g) => [g.slug, g])
);

export const RESOURCE_SLUGS = RESOURCE_GUIDES.map((g) => g.slug);
