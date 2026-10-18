import { Gauge, Mail, MapPin, Search } from "lucide-react";
import { ToolGuide, type ToolGuideContent } from "@/app/(marketing)/tools/tool-guide";
import { FAQPageJsonLd, type FaqItem } from "@/components/seo/json-ld";

const FAQS: FaqItem[] = [
    {
        question: "What metrics does the Reputation Score Checker display?",
        answer: "This free tool retrieves two public metrics from Google Places for your listing: your cumulative average star rating (out of 5.0) and your total published Google review count.",
    },
    {
        question: "Why does the checker not show response coverage?",
        answer: "Google's public Places API displays ratings and review counts, but does not disclose whether an owner response has been published for each review. Tracking response coverage requires connecting your Google Business Profile to a dedicated review inbox.",
    },
    {
        question: "How can a local business improve its Google reputation score?",
        answer: "The most dependable method is establishing a consistent post-service review request habit. Inviting genuine feedback consistently builds review volume over time, provides current social proof, and cushions your average rating against occasional negative reviews.",
    },
    {
        question: "How many Google reviews should a local business aim for?",
        answer: "Google does not publish a minimum review threshold for local ranking. Benchmark your profile against active competitors in your specific city and category to understand typical review volume in your market.",
    },
    {
        question: "Does a higher star rating guarantee a top Google Local 3-Pack ranking?",
        answer: "No. Google documents three primary local ranking factors: relevance, distance, and prominence. Review count and positive ratings contribute to prominence, but physical proximity to the searcher and category relevance remain equally influential.",
    },
];

const CONTENT: ToolGuideContent = {
    slug: "reputation-score-checker",
    about: {
        title: "About the Reputation Score Checker",
        paragraphs: [
            "The Reputation Score Checker queries public Google Places data to provide an instant snapshot of your Google Business Profile rating and review volume. It is built for local business owners, multi-location operators, and marketing teams who need a quick, unauthenticated baseline of their public Google reputation before planning local SEO or review generation initiatives.",
            "Public rating and review count are among the first details prospective customers evaluate when searching on Google Maps. Monitoring these metrics helps you assess how your profile appears to local searchers.",
        ],
    },
    steps: {
        title: "How to check your reputation in 4 steps",
        items: [
            { icon: Search, label: "Enter business details", text: "Type your business name and city into the search input." },
            { icon: MapPin, label: "Select your listing", text: "Choose your verified Google profile from the autocomplete dropdown list." },
            { icon: Gauge, label: "Run the snapshot", text: <>Click &quot;Check reputation&quot; to fetch your current public Google rating and review count.</> },
            { icon: Mail, label: "Optional email record", text: "Enter your email address if you want to store a copy of the diagnostic snapshot in your inbox." },
        ],
    },
    tips: {
        title: "Practical tips and rating buffer example",
        paragraphs: [
            "Consider a service business with a 4.1 average rating across 20 reviews. Because the total review count is relatively small, receiving two unaddressed 1-star reviews causes a noticeable dip in the average score. In contrast, a business with 150 reviews can absorb occasional negative feedback without sharp rating volatility.",
            "Consistently requesting reviews from genuine customers after service visits builds a protective buffer over time. To track whether you have responded to all recent reviews, use a connected dashboard like Zyene Reviews that monitors incoming feedback across Google and other platforms in real time.",
        ],
    },
    faqs: FAQS,
    related: [
        { href: "/resources/local-seo-checklist", label: "Local SEO Checklist (40+ Optimization Steps)", note: "Comprehensive Google Business Profile audit and maintenance." },
        { href: "/blog/how-reviews-impact-local-map-pack-ranking", label: "How Google Reviews Impact Local Map Pack Ranking", note: "Analysis of documented local ranking factors and prominence signals." },
        { href: "/resources/google-reviews-guide", label: "Google Reviews: Complete Local Business Guide", note: "Policies, verification rules, and response workflows." },
    ],
};

export function ReputationScoreCheckerGuide() {
    return (
        <>
            <FAQPageJsonLd faqs={FAQS} />
            <ToolGuide content={CONTENT} />
        </>
    );
}
