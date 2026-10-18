import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import { FreeToolJsonLd } from "@/components/seo/json-ld";
import { ReputationScoreCheckerClient } from "./reputation-score-checker-client";
import { MarketingClosingBand } from "@/components/marketing/marketing-closing-band";
import { ReputationScoreCheckerGuide } from "./reputation-score-checker-guide";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Free Reputation Score Checker",
    description:
        "Check your public Google rating and review count in one free snapshot. See how your local reputation stacks up before you improve it.",
    alternates: { canonical: "https://www.zyenereviews.com/tools/reputation-score-checker" },
    openGraph: {
        title: "Free Reputation Score Checker",
        description: "Check your public Google rating and review count in a free reputation snapshot for local businesses.",
        url: "https://www.zyenereviews.com/tools/reputation-score-checker",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Reputation Score Checker",
        description: "Check your public Google rating and review count in a free reputation snapshot.",
    },
});

export default function ReputationScoreCheckerPage() {
    return (
        <>
            <FreeToolJsonLd name="Free Reputation Score Checker" description="Check a business's public Google rating and review count in one free reputation snapshot." path="/tools/reputation-score-checker" />
            <ReputationScoreCheckerClient />
            <ReputationScoreCheckerGuide />
            <MarketingClosingBand
                title="Keep your rating moving in the right direction"
                text="Zyene Reviews helps you request reviews from genuine customers after service visits and monitors incoming feedback across Google and other platforms in one inbox."
                trackLocation="reputation-score-checker-final"
                headingId="reputation-score-checker-final-heading"
            />
        </>
    );
}
