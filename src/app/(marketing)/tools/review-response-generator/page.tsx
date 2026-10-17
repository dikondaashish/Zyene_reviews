import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import { FreeToolJsonLd } from "@/components/seo/json-ld";
import { ReviewResponseGeneratorClient } from "./review-response-generator-client";
import { ReviewResponseGeneratorGuide } from "./review-response-generator-guide";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Free Review Response Template Generator",
    description:
        "Paste any customer review and get a professional response draft instantly. Free generator for local businesses - unlock more templates with your email.",
    alternates: { canonical: "https://www.zyenereviews.com/tools/review-response-generator" },
    openGraph: {
        title: "Free Review Response Generator",
        description: "Paste a customer review and get a professional response draft instantly.",
        url: "https://www.zyenereviews.com/tools/review-response-generator",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Review Response Generator",
        description: "Paste a customer review and get a professional response draft instantly.",
    },
});

export default function ReviewResponseGeneratorPage() {
    return (
        <>
            <FreeToolJsonLd name="Free Review Response Generator" description="Paste a customer review and get a professional response draft for Google, Yelp, or Facebook instantly." path="/tools/review-response-generator" />
            <ReviewResponseGeneratorClient />
            <ReviewResponseGeneratorGuide />
        </>
    );
}
