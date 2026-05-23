import type { Metadata } from "next";
import { ReputationScoreCheckerClient } from "./reputation-score-checker-client";

export const metadata: Metadata = {
    title: "Free Reputation Score Checker | Zyene Reviews",
    description: "Check your Google rating, review count, and estimated response rate. Free reputation snapshot for local businesses.",
    alternates: { canonical: "https://zyenereviews.com/tools/reputation-score-checker" },
    openGraph: {
        title: "Free Reputation Score Checker, Zyene Reviews",
        description: "Check your Google rating, review count, and response rate, free reputation snapshot for local businesses.",
        url: "https://zyenereviews.com/tools/reputation-score-checker",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Reputation Score Checker, Zyene Reviews",
        description: "Check your Google rating, review count, and response rate, free reputation snapshot.",
    },
};

export default function ReputationScoreCheckerPage() {
    return <ReputationScoreCheckerClient />;
}
