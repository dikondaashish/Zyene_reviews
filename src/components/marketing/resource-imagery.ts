const RESOURCE_IMAGES: Record<string, { src: string; alt: string }> = {
    "google-reviews-guide": { src: "/images/blog/covers/google-review-request-playbook.jpg", alt: "A guide to thoughtful customer review requests" },
    "negative-review-templates": { src: "/images/blog/covers/responding-to-one-star-review.jpg", alt: "Preparing a thoughtful response to customer feedback" },
    "local-seo-checklist": { src: "/images/blog/covers/google-business-profile-audit.jpg", alt: "Reviewing a business profile and local search presence" },
    "review-request-templates": { src: "/marketing/home/cafe-service.webp", alt: "A barista serving iced coffee to a customer" },
};
export function resourceImage(slug: string) { return RESOURCE_IMAGES[slug] ?? RESOURCE_IMAGES["google-reviews-guide"]; }
