import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import { FreeToolJsonLd } from "@/components/seo/json-ld";
import { ReviewLinkGeneratorClient } from "./review-link-generator-client";
import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";
import { ReviewLinkGeneratorGuide } from "./review-link-generator-guide";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Free Google Review Link Generator",
    description:
        "Find your business and create a direct review URL with our free Google review link generator so customers can open your rating dialog in one click.",
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
            <FreeToolJsonLd name="Free Google Review Link Generator" description="Find your business on Google Maps and generate a direct Google review link to share by text, email, or QR code." path="/tools/review-link-generator" />
            <ReviewLinkGeneratorClient />
            <ReviewLinkGeneratorGuide />
            <MarketingClosingBand
                title="Send your review link automatically"
                text="Send this link automatically by SMS and email after every visit with Zyene Reviews."
                trackLocation="review-link-generator-final"
                headingId="review-link-generator-final-heading"
            />
        </>
    );
}
