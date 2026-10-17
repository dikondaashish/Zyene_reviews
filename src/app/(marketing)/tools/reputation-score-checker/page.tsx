import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import { FreeToolJsonLd } from "@/components/seo/json-ld";
import { ReputationScoreCheckerClient } from "./reputation-score-checker-client";
import { ReputationScoreCheckerGuide } from "./reputation-score-checker-guide";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Free Reputation Score Checker",
    description:
        "Check your Google rating, review count, and estimated response rate in one free snapshot. See how your local reputation stacks up before you improve it.",
    alternates: { canonical: "https://www.zyenereviews.com/tools/reputation-score-checker" },
    openGraph: {
        title: "Free Reputation Score Checker",
        description: "Check your Google rating, review count, and response rate, free reputation snapshot for local businesses.",
        url: "https://www.zyenereviews.com/tools/reputation-score-checker",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Reputation Score Checker",
        description: "Check your Google rating, review count, and response rate, free reputation snapshot.",
    },
});

export default function ReputationScoreCheckerPage() {
    return (
        <>
            <FreeToolJsonLd name="Free Reputation Score Checker" description="Check a business's Google rating, review count, and estimated response rate in one free reputation snapshot." path="/tools/reputation-score-checker" />
            <ReputationScoreCheckerClient />
            <ReputationScoreCheckerGuide />
        </>
    );
}
