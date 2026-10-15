import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import { ReviewLinkGeneratorClient } from "./review-link-generator-client";
import { ReviewLinkGeneratorGuide } from "./review-link-generator-guide";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Free Google Review Link Generator",
    description:
        "Find your business on Google Maps and generate a direct review link to share by text, email or QR code. Free Google review link generator.",
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
    return (
        <>
            <ReviewLinkGeneratorClient />
            <ReviewLinkGeneratorGuide />
        </>
    );
}
