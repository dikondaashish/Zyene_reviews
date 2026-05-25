import type { FaqItem } from "@/components/seo/json-ld";
import type { ResourceGuide } from "./resource-data";
import { REVIEW_REQUEST_TEMPLATES_BODY } from "./resource-review-request-templates-body";

/** Phase 3 lead magnet — /resources/review-request-templates */
export const reviewRequestTemplatesGuide: ResourceGuide = {
    slug: "review-request-templates",
    title: "20 Review Request Templates for Local Businesses",
    subtitle:
        "Free SMS and email swipe file for honest Google review outreach—restaurants, dental, home services, salons, reminders, thank-yous, and private feedback follow-ups.",
    excerpt:
        "22 copy-paste review request templates (SMS, email, industry-specific) with compliance notes and a comparison of manual outreach vs Zyene Reviews campaigns.",
    purpose: "Lead magnet + rank for review request template keywords",
    lastUpdated: "2026-05-25",
    readMinutes: 14,
    metaTitle: "20 Review Request Templates (SMS & Email)",
    metaDescription:
        "Free review request templates for local businesses: SMS, email, restaurant, dental, HVAC, reminders, and compliant outreach—plus how Zyene Reviews automates campaigns.",
    keywords: [
        "review request templates",
        "review request email template",
        "review request sms template",
        "google review request template",
        "review request templates local business",
    ],
    resourceLabel: "Free Template Pack",
    openingSummary:
        "This pack gives local owners 20+ short SMS and email scripts for honest Google review requests—plus reminders, thank-yous, and private feedback follow-ups. Use it to start outreach today; automate fair campaigns and alerts with Zyene Reviews when manual copy-paste stops scaling.",
    internalLinks: [
        { label: "Review collection features", href: "/features/review-collection" },
        { label: "Negative Feedback Shield guide", href: "/blog/negative-feedback-shield" },
        { label: "Compare review platforms", href: "/compare" },
        { label: "Zyene Reviews pricing", href: "/pricing" },
        { label: "Start free trial", href: "/signup" },
    ],
    faqs: [
        {
            question: "Can I copy these review request templates for free?",
            answer:
                "Yes. This page is an ungated swipe file—copy any template and replace [Name], [Business Name], and [link] with your details. PDF download and email capture are planned as a later follow-up; bookmark this URL for now.",
        },
        {
            question: "Is it okay to only send review requests to happy customers?",
            answer:
                "No. Selectively asking only satisfied customers is review gating and violates Google policies. Ask customers fairly, avoid incentives for positive reviews, and use private feedback channels (like Zyene Reviews' Negative Feedback Shield) to resolve issues—not to block honest public reviews.",
        },
        {
            question: "How many follow-ups should I send?",
            answer:
                "One initial request and at most one polite reminder per transaction is a good default. More than that feels like pressure and increases opt-outs. Templates 16–17 and 22 in this pack are written as single follow-ups.",
        },
        {
            question: "How does Zyene Reviews automate these templates?",
            answer:
                "You configure SMS, email, or QR campaigns in the dashboard, connect triggers (e.g., Zapier or POS), and send branded review pages on collectratings.com. Zyene tracks requests, alerts you on new reviews, and supports AI-assisted replies—see /features/review-collection.",
        },
        {
            question: "Which template should a restaurant or dental practice use?",
            answer:
                "Restaurants: template 10 (dining). Dental: templates 5 and 11 (appointment tone). Home services: template 13. All industries can start with templates 1 (SMS) and 6 (email), then personalize. See /compare if you are evaluating software to send at scale.",
        },
    ],
    tableOfContents: [
        { anchor: "compliance-fair-outreach", label: "Compliance: Fair Outreach" },
        { anchor: "sms-review-request-templates", label: "SMS Templates" },
        { anchor: "email-review-request-templates", label: "Email Templates" },
        { anchor: "industry-specific-templates", label: "Industry-Specific" },
        { anchor: "reminder-thank-you-private-feedback", label: "Reminder & Thank-You" },
        { anchor: "how-zyene-reviews-automates-this-workflow", label: "How Zyene Automates" },
        { anchor: "manual-vs-spreadsheet-vs-zyene-reviews", label: "Manual vs Zyene" },
    ],
    body: REVIEW_REQUEST_TEMPLATES_BODY,
};

export const REVIEW_REQUEST_TEMPLATES_FAQS: FaqItem[] = reviewRequestTemplatesGuide.faqs ?? [];
