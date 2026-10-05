import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import { ReviewLinkGeneratorClient } from "./review-link-generator-client";

export const metadata: Metadata = mergeMarketingSocial({
    title: "How to Get a Google Review Link (Free Generator)",
    description:
        "Free Google review link generator - find your listing and get a shareable 'Write a review' URL in seconds. No signup. Used by local businesses to collect more reviews.",
    alternates: { canonical: "https://www.zyenereviews.com/tools/review-link-generator" },
    openGraph: {
        title: "Free Google Review Link Generator",
        description: "Generate a direct Google review link for your business, free, no signup required.",
        url: "https://www.zyenereviews.com/tools/review-link-generator",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Google Review Link Generator",
        description: "Generate a direct Google review link for your business, free, no signup required.",
    },
});

export default function ReviewLinkGeneratorPage() {
    return <ReviewLinkGeneratorClient />;
}
