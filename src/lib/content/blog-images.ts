import type { ContentImage } from "./blog-types";

const BLOG_IMAGE_BASE = "/images/blog/covers";

/**
 * One editorial image per post. Keep these concept-specific so a post's
 * visual reinforces its search intent instead of repeating a generic hero.
 */
export const BLOG_IMAGES: Record<string, ContentImage> = {
    "how-to-get-50-google-reviews-in-30-days": {
        src: `${BLOG_IMAGE_BASE}/google-review-request-playbook.jpg`,
        alt: "Local cafe owner sending a customer review request from a smartphone after a busy shift",
        width: 1672,
        height: 941,
        caption: "A timely, personal review request fits naturally into a local business follow-up routine.",
    },
    "why-google-reviews-matter-in-2026": {
        src: `${BLOG_IMAGE_BASE}/why-google-reviews-matter.jpg`,
        alt: "Customer reading local business reviews on a smartphone outside a neighborhood bakery",
        width: 1672,
        height: 941,
        caption: "Customers often check recent reviews before deciding which local business to visit.",
    },
    "birdeye-pricing-breakdown-2026": {
        src: `${BLOG_IMAGE_BASE}/review-software-pricing-comparison.jpg`,
        alt: "Small business owner comparing review management software costs at a worktable",
        width: 1672,
        height: 941,
        caption: "A practical software comparison starts with locations, limits, and the work your team actually needs.",
    },
    "birdeye-alternatives-for-local-businesses": {
        src: `${BLOG_IMAGE_BASE}/birdeye-alternatives-cost-comparison.jpg`,
        alt: "Local business manager evaluating an affordable reputation management setup on a laptop",
        width: 1672,
        height: 941,
        caption: "Local teams can compare reputation tools by fit and total cost, not headline features alone.",
    },
    "how-to-respond-to-a-1-star-review": {
        src: `${BLOG_IMAGE_BASE}/responding-to-one-star-review.jpg`,
        alt: "Restaurant owner thoughtfully drafting a calm response to a one-star review on a laptop",
        width: 1672,
        height: 941,
        caption: "A calm, specific response gives a business a chance to show how it handles a difficult experience.",
    },
    "ai-reply-mistakes-to-avoid": {
        src: `${BLOG_IMAGE_BASE}/ai-review-reply-oversight.jpg`,
        alt: "Retail business owner reviewing an AI-drafted customer reply before publishing it",
        width: 1672,
        height: 941,
        caption: "AI can speed up drafting, but a person should check every reply for accuracy and tone.",
    },
    "google-business-profile-optimization-checklist": {
        src: `${BLOG_IMAGE_BASE}/google-business-profile-audit.jpg`,
        alt: "Bakery owner cross-checking Google Business Profile details against a printed checklist",
        width: 1672,
        height: 941,
        caption: "Accurate hours, services, and contact details make a local listing easier for customers to trust.",
    },
    "how-reviews-impact-local-map-pack-ranking": {
        src: `${BLOG_IMAGE_BASE}/local-map-pack-visibility.jpg`,
        alt: "Local business owner checking map visibility on a smartphone outside a neighborhood storefront",
        width: 1672,
        height: 941,
        caption: "Local search visibility is best evaluated alongside relevance, distance, prominence, and customer experience.",
    },
    "restaurant-owners-guide-to-google-reviews": {
        src: `${BLOG_IMAGE_BASE}/restaurant-review-management.jpg`,
        alt: "Restaurant owner managing customer feedback during a busy dinner service",
        width: 1672,
        height: 941,
        caption: "Restaurants can make review follow-up part of the same rhythm as service recovery and guest care.",
    },
    "dental-practice-reputation-management-2026": {
        src: `${BLOG_IMAGE_BASE}/dental-practice-reputation.jpg`,
        alt: "Dental practice manager reviewing patient feedback and reputation notes in a clinic reception area",
        width: 1672,
        height: 941,
        caption: "Healthcare reputation work should pair attentive feedback handling with careful privacy practices.",
    },
    "true-cost-of-bad-online-reputation": {
        src: `${BLOG_IMAGE_BASE}/online-reputation-business-impact.jpg`,
        alt: "Local restaurant owner reflecting on customer feedback in a quiet dining room before opening",
        width: 1672,
        height: 941,
        caption: "Online reputation can shape the trust and foot traffic a local business works to earn every day.",
    },
    "how-to-handle-fake-google-reviews": {
        src: `${BLOG_IMAGE_BASE}/fake-review-evidence.jpg`,
        alt: "Business manager organizing receipts and notes to document a suspicious online review",
        width: 1672,
        height: 941,
        caption: "Documenting dates, customer records, and other context helps a business make a factual platform report.",
    },
    "negative-feedback-shield": {
        src: `${BLOG_IMAGE_BASE}/private-feedback-service-recovery.jpg`,
        alt: "Local business owner listening to a customer during a private service recovery conversation",
        width: 1672,
        height: 941,
        caption: "Private feedback gives a team a focused place to listen, respond, and work toward service recovery.",
    },
    "ai-visibility-audit-local-businesses": {
        src: `${BLOG_IMAGE_BASE}/ai-visibility-audit.jpg`,
        alt: "Local entrepreneur comparing AI search answers and taking notes for a visibility audit",
        width: 1672,
        height: 941,
        caption: "An AI visibility audit checks whether assistants can find and describe a local business accurately.",
    },
    "how-to-respond-to-a-positive-review": {
        src: `${BLOG_IMAGE_BASE}/positive-google-review-response.jpg`,
        alt: "Local business owner writing a thankful response to a positive customer review on a smartphone",
        width: 1672,
        height: 941,
        caption: "A specific thank-you helps turn a positive review into a genuine customer relationship moment.",
    },
};

export function getBlogImage(slug: string): ContentImage {
    return BLOG_IMAGES[slug] ?? {
        src: "/images/blog/covers/why-google-reviews-matter.jpg",
        alt: "Local business owner reviewing customer feedback on a smartphone",
        width: 1672,
        height: 941,
        caption: "Customer feedback is part of a local business's day-to-day reputation work.",
    };
}
