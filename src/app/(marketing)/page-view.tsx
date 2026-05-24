import { MarketingHomeClient } from "@/components/marketing/marketing-home-client";
import {
    FAQPageJsonLd,
    OrganizationJsonLd,
    SoftwareApplicationJsonLd,
} from "@/components/seo/json-ld";

const HOME_FAQS = [
    {
        question: "How does the 7-day free trial work?",
        answer:
            "Sign up for Starter or Professional and get full access to every feature for 7 days. Cancel before the trial ends and you won't be charged. No hidden fees, no annual contracts, cancel anytime from your billing settings.",
    },
    {
        question: "How do review requests work?",
        answer:
            "You can send review requests via email, SMS, or a shareable link. Each request directs your customer to your custom review page where they can leave feedback or be guided to Google, Yelp, or Facebook.",
    },
    {
        question: "Does Zyene post AI replies directly to Google?",
        answer:
            "Zyene generates AI-powered reply suggestions in one click. You can review, edit, and post them to Google, keeping you in full control of your responses. The Auto commenter feature can post replies automatically on your behalf.",
    },
    {
        question: "Can I manage multiple locations?",
        answer:
            "Yes. The Professional plan supports up to 3 locations with independent limits per location. Enterprise plans offer unlimited locations.",
    },
    {
        question: "What happens to negative feedback?",
        answer:
            "Customers who rate 4–5 stars are guided to leave a public review on Google. Customers who rate 1–3 stars are directed to a private feedback form so you can resolve the issue before it goes public. This is the Negative Feedback Shield, included on every paid plan.",
    },
    {
        question: "Can I cancel anytime?",
        answer:
            "Absolutely. You can cancel your subscription anytime from your billing settings. No contracts, no hidden fees, no questions asked.",
    },
];

export default function MarketingHomePageView() {
    return (
        <>
            <OrganizationJsonLd />
            <SoftwareApplicationJsonLd />
            <FAQPageJsonLd faqs={HOME_FAQS} />
            <MarketingHomeClient />
        </>
    );
}
