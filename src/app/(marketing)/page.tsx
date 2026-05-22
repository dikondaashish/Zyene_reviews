import type { Metadata } from "next";
import { MarketingHomeClient } from "@/components/marketing/marketing-home-client";
import { SoftwareApplicationJsonLd, FAQPageJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
    title: "Zyene Reviews — Review Management for Local Businesses",
    description:
        "Monitor, respond to, and grow your Google reviews with AI. The only review management platform with a Negative Feedback Shield — routing bad reviews to private resolution before they hit Google. Starting at $29.99/mo, no annual contract.",
    alternates: {
        canonical: "https://zyenereviews.com/",
    },
    openGraph: {
        title: "Zyene Reviews — Review Management for Local Businesses",
        description:
            "AI-powered review management, competitor tracking, and local SEO for local businesses. Starting at $29.99/mo. 7-day free trial.",
        url: "https://zyenereviews.com/",
        type: "website",
    },
};

const HOME_FAQS = [
    {
        question: "How does the 7-day free trial work?",
        answer:
            "Sign up for Starter or Professional and get full access to every feature for 7 days. Cancel before the trial ends and you won't be charged. No hidden fees, no annual contracts — cancel anytime from your billing settings.",
    },
    {
        question: "How do review requests work?",
        answer:
            "You can send review requests via email, SMS, or a shareable link. Each request directs your customer to your custom review page where they can leave feedback or be guided to Google, Yelp, or Facebook.",
    },
    {
        question: "Does Zyene post AI replies directly to Google?",
        answer:
            "Zyene generates AI-powered reply suggestions in one click. You can review, edit, and post them to Google — keeping you in full control of your responses. The Auto commenter feature can post replies automatically on your behalf.",
    },
    {
        question: "Can I manage multiple locations?",
        answer:
            "Yes. The Professional plan supports up to 3 locations with independent limits per location. Enterprise plans offer unlimited locations.",
    },
    {
        question: "What happens to negative feedback?",
        answer:
            "Customers who rate 4–5 stars are guided to leave a public review on Google. Customers who rate 1–3 stars are directed to a private feedback form so you can resolve the issue before it goes public. This is the Negative Feedback Shield — included on every paid plan.",
    },
    {
        question: "Can I cancel anytime?",
        answer:
            "Absolutely. You can cancel your subscription anytime from your billing settings. No contracts, no hidden fees, no questions asked.",
    },
];

export default function MarketingPage() {
    return (
        <>
            {/* Structured data for rich search results */}
            <SoftwareApplicationJsonLd />
            <FAQPageJsonLd faqs={HOME_FAQS} />

            {/* The interactive homepage (Framer Motion, animations, pricing accordion) */}
            <MarketingHomeClient />
        </>
    );
}
