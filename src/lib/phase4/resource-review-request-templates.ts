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
                "Yes. Preview templates on this page are ungated—copy any script and replace [Name], [Business Name], and [link]. Optional email capture sends a dedicated message with a link back to this page (no PDF attachment yet).",
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
    howToSteps: [
        {
            name: "Copy a template and personalize placeholders",
            text: "Choose an SMS or email script from this page, replace [Name], [Business Name], and your review link, and adjust tone for your brand.",
        },
        {
            name: "Send within a few hours of a positive visit",
            text: "Deliver the first request soon after service while the experience is fresh. One polite reminder is enough—avoid repeated pressure.",
        },
        {
            name: "Follow compliance rules on every send",
            text: "Do not offer discounts for reviews, do not dictate review text, and do not ask only satisfied customers. Keep outreach fair and honest.",
        },
        {
            name: "Respond to reviews and route unhappy customers privately",
            text: "Reply to new Google reviews promptly. Use private feedback (e.g., Zyene Reviews Negative Feedback Shield) to resolve low scores before issues escalate—not to suppress public reviews.",
        },
        {
            name: "Automate at scale when manual copy-paste stops working",
            text: "Configure SMS, email, or QR campaigns in review software so every customer gets a consistent, trackable request workflow.",
        },
    ],
};

export const REVIEW_REQUEST_TEMPLATES_FAQS: FaqItem[] = reviewRequestTemplatesGuide.faqs ?? [];
