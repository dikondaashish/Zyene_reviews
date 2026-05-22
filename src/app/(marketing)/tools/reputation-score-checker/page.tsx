import type { Metadata } from "next";
import { ReputationScoreCheckerClient } from "./reputation-score-checker-client";

export const metadata: Metadata = {
    title: "Free Reputation Score Checker | Zyene Reviews",
    description: "Check your Google rating, review count, and estimated response rate. Free reputation snapshot for local businesses.",
    alternates: { canonical: "https://zyenereviews.com/tools/reputation-score-checker" },
};

export default function ReputationScoreCheckerPage() {
    return <ReputationScoreCheckerClient />;
}
