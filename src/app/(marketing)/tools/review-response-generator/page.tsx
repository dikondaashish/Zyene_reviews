import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import { FreeToolJsonLd } from "@/components/seo/json-ld";
import { ReviewResponseGeneratorClient } from "./review-response-generator-client";
import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";
import { ReviewResponseGeneratorGuide } from "./review-response-generator-guide";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Free Review Response Generator",
    description:
        "Pick a star rating and get a ready-to-edit reply. A free review response generator for local businesses, with 5 more templates by email.",
    alternates: { canonical: "https://www.zyenereviews.com/tools/review-response-generator" },
    openGraph: {
        title: "Free Review Response Generator",
        description: "Pick a star rating and get a ready-to-edit reply. A free review response generator for local businesses, with 5 more templates by email.",
        url: "https://www.zyenereviews.com/tools/review-response-generator",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Review Response Generator",
        description: "Pick a star rating and get a ready-to-edit reply. A free review response generator for local businesses, with 5 more templates by email.",
    },
});

export default function ReviewResponseGeneratorPage() {
    return (
        <>
            <FreeToolJsonLd name="Free Review Response Generator" description="Pick a star rating and get a ready-to-edit reply. A free review response generator for local businesses, with 5 more templates by email." path="/tools/review-response-generator" />
            <ReviewResponseGeneratorClient />
            <ReviewResponseGeneratorGuide />
            <MarketingClosingBand
                title="Reply to every review without starting from scratch"
                text="Zyene Reviews drafts AI replies and automatically replies to eligible new Google reviews on eligible paid plans, with a 7-day free trial."
                trackLocation="review-response-generator-final"
                headingId="review-response-generator-final-heading"
            />
        </>
    );
}
