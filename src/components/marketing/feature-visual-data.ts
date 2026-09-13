import type { FeaturePillarSlug } from "@/lib/growth/feature-pillars";
import type { ProductTourTab } from "@/components/marketing/product-tour/product-tour";

export const FEATURE_VISUALS: Record<FeaturePillarSlug, { headline: string; story: string; image: string; alt: string; tab?: ProductTourTab }> = {
    "review-monitoring": { headline: "Every review. One clear view.", story: "Stay close to your customers. Wherever they share.", image: "/marketing/home/cafe-conversation.webp", alt: "A barista speaking with a customer at a café counter", tab: "reviews" },
    "ai-replies": { headline: "Thoughtful replies. Without the blank page.", story: "Sound like yourself. Get your time back.", image: "/marketing/home/cafe-service.webp", alt: "A smiling barista serving coffee to a customer", tab: "reviews" },
    "review-collection": { headline: "Good experiences deserve to be heard.", story: "Make the next review a natural part of the visit.", image: "/images/industries/salons.webp", alt: "A stylist caring for a salon client", tab: "requests" },
    "competitor-tracking": { headline: "Get to know your competitive edge.", story: "A clearer picture of your local market.", image: "/marketing/home/storefront.webp", alt: "An independent local business storefront" },
    "local-seo": { headline: "Help your next customer find you.", story: "Your neighborhood is searching. Show up prepared.", image: "/images/industries/window-installation.webp", alt: "A tradesperson fitting a window frame with a cordless drill" },
    analytics: { headline: "Your reputation, in perspective.", story: "See the progress behind your everyday work.", image: "/marketing/about/team-collaboration.webp", alt: "A small business team reviewing their work", tab: "reports" },
};
