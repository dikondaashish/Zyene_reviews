import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import { ReviewLinkGeneratorClient } from "./review-link-generator-client";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Free Google Review Link Generator",
    description:
        "Create a direct Google review link for your business in seconds. Free tool for local owners — find your listing, enter email, get a write-review URL.",
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
