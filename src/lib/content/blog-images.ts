import type { ContentImage } from "./blog-types";

const BLOG_IMAGE_BASE = "/images/blog/covers";

/**
 * One editorial image per post. Keep these concept-specific so a post's
 * visual reinforces its search intent instead of repeating a generic hero.
 */
export const BLOG_IMAGES: Record<string, ContentImage> = {
    "how-to-get-50-google-reviews-in-30-days": {
        src: `${BLOG_IMAGE_BASE}/google-review-request-playbook-candid-v2.webp`,
        alt: "Cafe owner sending a follow-up message from a smartphone",
        width: 1672,
        height: 941,
        caption: "A timely, personal review request fits naturally into a local business follow-up routine.",
    },
    "why-google-reviews-matter-in-2026": {
        src: `${BLOG_IMAGE_BASE}/why-google-reviews-matter-candid-v2.webp`,
        alt: "Customer checking a smartphone outside a neighborhood bakery",
        width: 1672,
        height: 941,
        caption: "Customers often check recent reviews before deciding which local business to visit.",
    },
    "birdeye-pricing-breakdown-2026": {
        src: `${BLOG_IMAGE_BASE}/review-software-pricing-comparison-candid-v2.webp`,
        alt: "Shop owner comparing costs using paperwork, a notebook, and a laptop",
        width: 1672,
        height: 941,
        caption: "A practical software comparison starts with locations, limits, and the work your team actually needs.",
    },
    "birdeye-alternatives-for-local-businesses": {
        src: `${BLOG_IMAGE_BASE}/birdeye-alternatives-cost-comparison-candid-v2.webp`,
        alt: "Business manager checking paperwork and software costs beside a laptop",
        width: 1672,
        height: 941,
        caption: "Local teams can compare reputation tools by fit and total cost, not headline features alone.",
    },
    "how-to-respond-to-a-1-star-review": {
        src: `${BLOG_IMAGE_BASE}/responding-to-one-star-review-candid-v2.webp`,
        alt: "Takeaway restaurant owner drafting a customer response on a laptop",
        width: 1672,
        height: 941,
        caption: "A calm, specific response gives a business a chance to show how it handles a difficult experience.",
    },
    "ai-reply-mistakes-to-avoid": {
        src: `${BLOG_IMAGE_BASE}/ai-review-reply-oversight-candid-v2.webp`,
        alt: "Shop owner checking a draft on a laptop beside an order notebook",
        width: 1672,
        height: 941,
        caption: "AI can speed up drafting, but a person should check every reply for accuracy and tone.",
    },
    "google-business-profile-optimization-checklist": {
        src: `${BLOG_IMAGE_BASE}/google-business-profile-audit-candid-v2.webp`,
        alt: "Bakery owner checking a printed list beside a laptop in a bread preparation area",
        width: 1672,
        height: 941,
        caption: "Accurate hours, services, and contact details make a local listing easier for customers to trust.",
    },
    "how-reviews-impact-local-map-pack-ranking": {
        src: `${BLOG_IMAGE_BASE}/local-map-pack-visibility-candid-v2.webp`,
        alt: "Customer checking a smartphone on a neighborhood shopping street",
        width: 1672,
        height: 941,
        caption: "Local search visibility is best evaluated alongside relevance, distance, prominence, and customer experience.",
    },
    "restaurant-owners-guide-to-google-reviews": {
        src: `${BLOG_IMAGE_BASE}/restaurant-review-management-candid-v2.webp`,
        alt: "Restaurant owner listening to a guest at a table during service",
        width: 1672,
        height: 941,
        caption: "Restaurants can make review follow-up part of the same rhythm as service recovery and guest care.",
    },
    "dental-practice-reputation-management-2026": {
        src: `${BLOG_IMAGE_BASE}/dental-practice-reputation-candid-v2.webp`,
        alt: "Dental practice administrator reviewing notes beside a laptop in reception",
        width: 1672,
        height: 941,
        caption: "Healthcare reputation work should pair attentive feedback handling with careful privacy practices.",
    },
    "true-cost-of-bad-online-reputation": {
        src: `${BLOG_IMAGE_BASE}/online-reputation-business-impact-candid-v2.webp`,
        alt: "Restaurant owner reading customer feedback on a smartphone",
        width: 1672,
        height: 941,
        caption: "Online reputation can shape the trust and foot traffic a local business works to earn every day.",
    },
    "how-to-handle-fake-google-reviews": {
        src: `${BLOG_IMAGE_BASE}/fake-review-evidence-candid-v2.webp`,
        alt: "Hardware shop owner organizing receipts and recording dates beside a laptop",
        width: 1672,
        height: 941,
        caption: "Documenting dates, customer records, and other context helps a business make a factual platform report.",
    },
    "negative-feedback-shield": {
        src: `${BLOG_IMAGE_BASE}/private-feedback-service-recovery-candid-v2.webp`,
        alt: "Cafe owner listening to a customer during a quiet conversation",
        width: 1672,
        height: 941,
        caption: "Private feedback gives a team a focused place to listen, respond, and work toward service recovery.",
    },
    "ai-visibility-audit-local-businesses": {
        src: `${BLOG_IMAGE_BASE}/ai-visibility-audit-candid-v2.webp`,
        alt: "Business owner comparing a phone and laptop while taking notes at a cafe",
        width: 1672,
        height: 941,
        caption: "An AI visibility audit checks whether assistants can find and describe a local business accurately.",
    },
    "how-to-respond-to-a-positive-review": {
        src: `${BLOG_IMAGE_BASE}/positive-google-review-response-candid-v2.webp`,
        alt: "Cafe owner writing a customer response on a smartphone",
        width: 1672,
        height: 941,
        caption: "A specific thank-you helps turn a positive review into a genuine customer relationship moment.",
    },
    "how-to-get-a-google-review-link": {
        src: "/images/blog/google_review_link-candid-v2.webp",
        alt: "Customer using a smartphone beside a laptop and coffee at a cafe table",
        width: 1672,
        height: 941,
        caption: "A direct review link gives customers a straightforward starting point for sharing feedback.",
    },
    "can-you-delete-a-google-review": {
        src: `${BLOG_IMAGE_BASE}/delete-google-review-hero-candid-v2.webp`,
        alt: "Cafe owner reviewing customer feedback on a laptop at the counter",
        width: 1672,
        height: 941,
        caption: "Understanding Google's review policies is the first step toward protecting your business reputation.",
    },
    "hvac-home-services-reputation-management": {
        src: `${BLOG_IMAGE_BASE}/hvac-technician-customer-handshake-candid-v2.webp`,
        alt: "Service technician shaking hands with a homeowner after a visit",
        width: 1672,
        height: 941,
        caption: "The moment after a successful service call is the best time to earn a genuine customer review.",
    },
    "podium-pricing-vs-zyene-reviews": {
        src: `${BLOG_IMAGE_BASE}/podium-pricing-comparison-desk-candid-v2.webp`,
        alt: "Business owner checking an invoice with a calculator beside a laptop",
        width: 1672,
        height: 941,
        caption: "Compare software costs with the work and limits your business needs.",
    },
    "why-are-my-google-reviews-not-showing-up": {
        src: `${BLOG_IMAGE_BASE}/missing-google-reviews-laptop-candid-v2.webp`,
        alt: "Business owner checking customer feedback on a laptop",
        width: 1672,
        height: 941,
        caption: "Check review visibility carefully before deciding what needs follow-up.",
    },
    "how-to-ask-customers-for-reviews-sms-email-templates": {
        src: `${BLOG_IMAGE_BASE}/how-to-ask-for-reviews-hero-candid-v2.webp`,
        alt: "Bakery owner using a smartphone behind the counter",
        width: 1672,
        height: 941,
        caption: "A short, respectful follow-up can make sharing feedback part of the customer experience.",
    },
    "how-to-get-hvac-leads-from-google-maps": {
        src: `${BLOG_IMAGE_BASE}/hvac-google-maps-leads-hero-candid-v2.webp`,
        alt: "Contractor and dispatcher reviewing work together on a laptop in a service office",
        width: 1672,
        height: 941,
        caption: "Keep business details, customer feedback, and local visibility on the team's regular checklist.",
    },
};

export function getBlogImage(slug: string): ContentImage {
    return BLOG_IMAGES[slug] ?? {
        src: "/images/blog/covers/why-google-reviews-matter-candid-v2.webp",
        alt: "Customer checking a smartphone outside a neighborhood bakery",
        width: 1672,
        height: 941,
        caption: "Customer feedback is part of a local business's day-to-day reputation work.",
    };
}
