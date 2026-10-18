import { Copy, Star, Store } from "lucide-react";
import { ToolGuide, type ToolGuideContent } from "@/app/(marketing)/tools/tool-guide";
import { FAQPageJsonLd, type FaqItem } from "@/components/seo/json-ld";

const FAQS: FaqItem[] = [
    {
        question: "How long should a Google review response be?",
        answer: "Aim for 3 to 5 sentences or roughly 50 to 150 words. Concise responses communicate professionalism and accountability; overly long responses often look defensive or combative to prospective buyers reading the thread.",
    },
    {
        question: "Should a business reply to every customer review?",
        answer: "Yes. Replying to positive reviews reinforces customer loyalty, while responding calmly to negative or mixed reviews demonstrates to prospective customers reading the thread that your business is attentive and takes feedback seriously.",
    },
    {
        question: "How should I respond to a suspected fake or malicious review?",
        answer: "Post a calm, neutral response stating that you have no record of the customer or transaction, provide an official email for direct contact, and report the review to Google through your Google Business Profile account for policy review.",
    },
    {
        question: "Does this free tool analyze the text of my review using AI?",
        answer: "This free tool selects a curated, template-based structure matched to your chosen star rating; it does not analyze review sentiment or text meaning. Zyene Reviews' paid platform provides contextual AI drafts and automated reply workflows.",
    },
    {
        question: "Can I use the exact same response template for every customer?",
        answer: "No. Using identical copy on multiple reviews signals to customers that responses are automated. Always adapt the template by inserting unique details from the customer's specific feedback.",
    },
];

const CONTENT: ToolGuideContent = {
    slug: "review-response-generator",
    about: {
        title: "About the Review Response Templates tool",
        paragraphs: [
            <>The Review Response Templates tool is a free utility that picks a structured, professional reply template based on your business name and the customer&apos;s star rating (from 1 to 5 stars). It is designed for local business owners, office managers, customer support teams, and agency staff who want a proven response framework without starting from a blank page for every Google review.</>,
            "A clear, well-phrased reply shows prospective customers on Google Maps that you are responsive and take service quality seriously.",
        ],
    },
    steps: {
        title: "How to get a reply template in 3 steps",
        items: [
            { icon: Store, label: "Enter business name", text: "Type your business name as you want it to appear in the greeting." },
            { icon: Star, label: "Select star rating", text: "Choose the rating of the review you received (1, 2, 3, 4, or 5 stars)." },
            { icon: Copy, label: "Personalize and copy", text: <>Click &quot;Get reply template&quot;, customize the editable template with specific details from the customer&apos;s visit, and copy the text to post on Google.</> },
        ],
    },
    tips: {
        title: "Practical tips and editing example",
        paragraphs: [
            <>For a 2-star review citing a long wait, start with the matching template and insert personal specifics: <em>&quot;Hi Marcus, thank you for sharing this feedback. We apologize for the wait time during your Friday afternoon visit. Our kitchen fell behind our usual standard. We have reviewed staffing for that shift. Please contact us at support@example.com so we can make this right.&quot;</em></>,
            "Aim for roughly 50 to 150 words per public response. Avoid debating facts or negotiating financial settlements in public comments; instead, direct sensitive discussions to a private phone number or email address.",
        ],
    },
    faqs: FAQS,
    related: [
        { href: "/resources/negative-review-templates", label: "20+ Negative Review Response Templates (Google Reviews)", note: "Ready-to-use scripts for service, billing, and delay complaints." },
        { href: "/blog/how-to-respond-to-a-1-star-review", label: "How to Respond to a 1-Star Review (5 Real Templates)", note: "A practical 5-step framework for handling negative customer feedback." },
        { href: "/blog/ai-reply-mistakes-to-avoid", label: "5 AI Reply Mistakes to Avoid When Responding to Reviews", note: "Guidelines for editing and personalizing automated review drafts." },
    ],
};

export function ReviewResponseGeneratorGuide() {
    return (
        <>
            <FAQPageJsonLd faqs={FAQS} />
            <ToolGuide content={CONTENT} />
        </>
    );
}
