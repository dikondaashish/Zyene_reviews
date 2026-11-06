import type { BlogPostSource } from "@/lib/content/blog-types";
import { SIGNUP_URL } from "@/config/env";

export const howToDeleteYelpReviewsPost: BlogPostSource = {
    slug: "how-to-delete-yelp-reviews",
    title: "How to Delete Yelp Reviews: A Business Owner's Guide",
    excerpt:
        "Learn how to delete Yelp reviews that violate policy, report unfair ratings via Yelp for Business, and protect your local reputation from negative feedback.",
    pillar: "reputation-management",
    pillarLabel: "Reputation Management",
    publishedAt: "2026-11-06",
    dateModified: "2026-11-06",
    author: { name: "Marcus Vance", role: "Local SEO & Reputation" },
    metaTitle: "How to Delete Yelp Reviews: Business Owner Guide",
    metaDescription:
        "Learn how to delete Yelp reviews that violate policy, report unfair ratings via Yelp for Business, and protect your local reputation from negative feedback.",
    keywords: [
        "how to delete yelp reviews",
        "how to remove bad reviews on yelp",
        "can a business owner delete a yelp review",
        "yelp review removal policy",
        "report yelp review violation",
        "how to get rid of fake yelp reviews",
        "yelp for business review dispute",
        "remove 1 star yelp review",
    ],
    relatedSlugs: [
        "how-do-you-remove-google-reviews",
        "how-to-respond-to-a-1-star-review",
        "restaurant-review-management-service-recovery",
    ],
    internalLinks: [
        { label: "Review Management for Small Business", href: "/small-business" },
        { label: "5 AI Reply Mistakes to Avoid", href: "/blog/ai-reply-mistakes-to-avoid" },
        { label: "Restaurant Review Management & Recovery", href: "/blog/restaurant-review-management-service-recovery" },
        { label: "Free Review Response Generator", href: "/tools/review-response-generator" },
    ],
    faqs: [
        {
            question: "Can a business owner delete a negative Yelp review directly?",
            answer: "No. Business owners do not have the technical ability to delete reviews from their listing. You must report the review for Yelp moderators to evaluate against platform Content Guidelines.",
        },
        {
            question: "How long does Yelp take to evaluate a reported review?",
            answer: "Yelp typically processes reports within several business days. While under evaluation, the review remains visible to the public with a temporary tag until moderators reach a decision.",
        },
        {
            question: "Will Yelp remove a review if I prove the customer is lying?",
            answer: "Yelp rarely removes reviews over factual disagreements because moderators do not verify transaction details. You must demonstrate a clear policy breach, such as lack of firsthand experience or conflict of interest.",
        },
        {
            question: "Does deleting or unclaiming my Yelp business page remove the reviews?",
            answer: "No. Unclaiming your page does not remove public reviews. Yelp considers business listings public record and only removes pages entirely if the business has permanently closed.",
        },
        {
            question: "Can I pay Yelp or third-party agencies to delete bad reviews?",
            answer: "No. Yelp does not offer any paid service to remove or reorder reviews, and advertising does not influence recommendation software. Any agency claiming they can delete legitimate reviews for a fee is deceptive.",
        },
    ],
    body: [
        {
            type: "summary",
            text: "Direct Answer: Business owners cannot directly delete Yelp reviews. You can only remove a review by reporting a violation of Yelp's Content Guidelines (conflicts of interest, lack of firsthand experience, or harassment), guiding a resolved customer to remove their own post, or diluting permanent negative feedback with an automated review generation routine.",
        },
        {
            type: "p",
            text: "You stand behind your counter after a rush of customers, check your phone, and see a fresh 1-star Yelp notification. The reviewer claims a staff member was rude during a shift when you were the only person working, or describes items you have never sold. The immediate impulse is to click 'delete'—but on Yelp, business owners have no direct removal button.",
        },
        {
            type: "h2",
            text: "1. Yelp's Content Guidelines: What Actually Qualifies for Removal",
        },
        {
            type: "p",
            text: "Yelp moderators only remove reviews that violate explicit platform rules. They do not arbitrate factual disputes or subjective opinions. Legitimate grounds for removal include Conflicts of Interest (reviews by competitors, current or former employees), Lack of Firsthand Experience (hearsay, news rants, viral social media brigades), and Inappropriate Content (hate speech, threats, and privacy violations).",
        },
        {
            type: "image",
            image: {
                src: "/images/blog/reporting_yelp_review_dashboard.jpg",
                alt: "Business owner reporting a policy-violating review through Yelp for Business moderation dashboard",
                width: 1200,
                height: 675,
                caption: "Reporting a review in the Yelp for Business dashboard flags the content for manual moderator review.",
            },
        },
        {
            type: "h2",
            text: "2. Yelp Violation Likelihood Matrix",
        },
        {
            type: "table",
            table: {
                headers: ["Violation Category", "Typical Scenario", "Removal Likelihood", "Required Evidence"],
                rows: [
                    ["Conflict of Interest", "Terminated employee or rival owner leaves a 1-star review", "High", "Proof of employment or competitor ownership"],
                    ["Lack of Firsthand Experience", "User posts based on a viral video or news report", "High", "Text admitting reviewer never visited"],
                    ["Inappropriate Content", "Review contains profanity, slurs, or harassment", "High", "Flag specific violating language"],
                    ["Factual Dispute", "Customer claims bad service; owner states it never happened", "Low", "Yelp does not investigate customer transactions"],
                    ["Promotional Content", "User posts links to competitor websites or promotional spam", "High", "Self-promotional link or promotional text"],
                ],
            },
        },
        {
            type: "h2",
            text: "3. Step-by-Step: Reporting a Review on Yelp",
        },
        {
            type: "ol",
            items: [
                "**Log into Yelp for Business:** Access your business portal via desktop browser or the mobile application.",
                "**Locate the Review:** Navigate to the 'Reviews' tab and find the specific offending post.",
                "**Click Report:** On desktop, click the three-dot menu and select 'Report Review'. On mobile, tap the flag icon.",
                "**Choose the Violation Category:** Select the exact guideline violated (Conflict of interest, Relevance, etc.) and write a concise factual explanation.",
                "**Monitor Status:** Check your dashboard for the 'Under Evaluation' indicator and track moderator updates via email.",
            ],
        },
        {
            type: "image",
            image: {
                src: "/images/blog/customer_updating_review_mobile.jpg",
                alt: "Customer using smartphone to remove a Yelp review after successful customer service recovery",
                width: 1200,
                height: 675,
                caption: "When service recovery resolves a dispute, customers can delete their own review directly in their Yelp app.",
            },
        },
        {
            type: "h2",
            text: "4. Helping a Customer Remove Their Own Review",
        },
        {
            type: "p",
            text: "The fastest way to eliminate a negative Yelp review is successful service recovery. When you resolve a customer's grievance, politely guide them to remove or update their feedback. On desktop, they visit their profile, navigate to 'Reviews', and click the trash can icon. On mobile, they tap 'Me' > 'Reviews' > three-dot menu > 'Remove Review'.",
        },
        {
            type: "h2",
            text: "5. Public Damage Control When Removal Is Denied",
        },
        {
            type: "p",
            text: "If Yelp denies your removal request, shift immediately to damage control. Prospective customers reading your profile evaluate how management handles criticism. Write a calm, professional public response: acknowledge their visit, state your service standard, and provide a direct offline contact. Never argue details publicly.",
        },
        {
            type: "image",
            image: {
                src: "/images/blog/responding_to_yelp_reviews_calmly.webp",
                alt: "Business owner calmly drafting a professional public review response on a laptop",
                width: 1672,
                height: 941,
                caption: "A measured, professional public response reassures future customers even when review removal is denied.",
            },
        },
        {
            type: "h2",
            text: "6. Diluting Unremovable Reviews with Fresh Volume",
        },
        {
            type: "p",
            text: "Yelp's recommendation algorithm and consumer sentiment both prioritize recent experiences. A solitary 1-star complaint loses its impact when flanked by a dozen fresh 5-star ratings from the past thirty days. Building a steady, automated review routine is the most reliable long-term defense against isolated critics.",
        },
        {
            type: "warning",
            text: "Never engage in 'Review Gating'. Filtering customers with surveys to send only happy diners to public platforms violates Yelp terms and FTC guidelines, risking a damaging Consumer Alert banner on your listing.",
        },
        {
            type: "h2",
            text: "Streamline Your Review Management with Zyene",
        },
        {
            type: "p",
            text: "Zyene Reviews automates your post-service follow-up, provides private feedback channels to resolve customer issues before they reach public forums, and crafts AI-assisted reply drafts in your authentic brand voice.",
        },
        {
            type: "cta",
            ctaLabel: "Start Managing Your Reviews with Zyene Free →",
            ctaHref: SIGNUP_URL,
        },
    ],
};
