import type { Metadata } from "next";
import { ReviewResponseGeneratorClient } from "./review-response-generator-client";

export const metadata: Metadata = {
    title: "Free Review Response Template Generator | Zyene Reviews",
    description: "Paste a customer review and get a professional response draft. Email to unlock 5 more templates.",
    alternates: { canonical: "https://zyenereviews.com/tools/review-response-generator" },
};

export default function ReviewResponseGeneratorPage() {
    return <ReviewResponseGeneratorClient />;
}
