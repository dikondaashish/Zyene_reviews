import { Copy, Mail, MapPin, Search } from "lucide-react";
import { ToolGuide, type ToolGuideContent } from "@/app/(marketing)/tools/tool-guide";
import { FAQPageJsonLd, type FaqItem } from "@/components/seo/json-ld";

const FAQS: FaqItem[] = [
    {
        question: "What is a Google Place ID?",
        answer: "A Google Place ID is a unique alphanumeric identifier assigned by Google to physical locations on Google Maps. This tool retrieves your Place ID from the Google Places API to construct your direct review submission link.",
    },
    {
        question: "Does this link open the review box directly?",
        answer: "Yes. Using Google's official writereview?placeid= URL structure prompts the browser to load your listing and immediately trigger the rating and review dialogue box if the user is signed into a Google account.",
    },
    {
        question: "What size should a review QR code be for print?",
        answer: "For receipts, business cards, table tents, or counter signage, print your QR code at least 1 x 1 inch (25 x 25 mm). Ensure high contrast with dark elements on a light background and a clear blank border around the code.",
    },
    {
        question: "Do customers need a Google account to submit a review?",
        answer: "Yes. Google requires reviewer authentication through an active Google account to post public reviews on Google Maps and Google Search to reduce spam and unverified submissions.",
    },
    {
        question: "Can I use this link in automated SMS or email messages?",
        answer: "Yes. You can paste the generated URL directly into SMS and email messages. Zyene Reviews also provides automated review collection campaigns that send direct links after customer visits or transactions.",
    },
];

const CONTENT: ToolGuideContent = {
    slug: "review-link-generator",
    about: {
        title: "About the Google Review Link Generator",
        paragraphs: [
            "The Google Review Link Generator is a free utility that looks up your official Google Place ID using Google Places data and formats a direct review submission URL. It is designed for local business owners, healthcare practices, contractors, retail operators, and service professionals who need a reliable link to share with customers via text message, email invoices, or printed QR codes.",
            "Instead of asking customers to open Google Maps, search for your business name, and locate the review button, a direct URL opens the rating dialog in one click on both desktop and mobile browsers.",
        ],
    },
    steps: {
        title: "How to use this tool in 4 steps",
        items: [
            { icon: Search, label: "Search for your business", text: "Enter your business name and city in the search bar above." },
            { icon: MapPin, label: "Select your listing", text: "Choose your verified location from the Google autocomplete suggestions to load its Place ID." },
            { icon: Mail, label: "Optional email backup", text: "Enter your email address if you want a copy of your link sent directly to your inbox." },
            { icon: Copy, label: "Copy and distribute", text: <>Click &quot;Get my review link&quot; and copy the URL into your customer outreach templates or QR code generator.</> },
        ],
    },
    tips: {
        title: "Practical tips and print example",
        paragraphs: [
            <>A typical post-service follow-up message can be short and direct: <em>&quot;Hi John, thanks for visiting Apex Auto today. If you have a minute, please share your experience on Google: [Your Link]&quot;</em>.</>,
            "If you convert your review URL into a printed QR code for invoices, appointment cards, or counter displays, print it at a minimum of 1 x 1 inch (25 x 25 mm). Maintain high contrast and a clear blank border around the code so smartphone cameras can scan it without focusing delays.",
        ],
    },
    faqs: FAQS,
    related: [
        { href: "/blog/how-to-get-a-google-review-link", label: "How to Get a Google Review Link (Step-by-Step Guide)", note: "Manual Place ID lookup and link testing methods." },
        { href: "/resources/review-request-templates", label: "Free Review Request Template Pack (SMS + Email)", note: "Ready-to-use message scripts for local businesses." },
        { href: "/blog/how-to-get-50-google-reviews-in-30-days", label: "How to Get 50 Google Reviews in 30 Days", note: "Timing and customer outreach strategies." },
    ],
};

export function ReviewLinkGeneratorGuide() {
    return (
        <>
            <FAQPageJsonLd faqs={FAQS} />
            <ToolGuide content={CONTENT} />
        </>
    );
}
