import type { Metadata } from "next";
import { ReviewResponseGeneratorClient } from "./review-response-generator-client";

export const metadata: Metadata = {
    title: "Free Review Response Template Generator | Zyene Reviews",
    description: "Paste a customer review and get a professional response draft. Email to unlock 5 more templates.",
    alternates: { canonical: "https://zyenereviews.com/tools/review-response-generator" },
    openGraph: {
        title: "Free Review Response Generator, Zyene Reviews",
        description: "Paste a customer review and get a professional response draft instantly.",
        url: "https://zyenereviews.com/tools/review-response-generator",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Review Response Generator, Zyene Reviews",
        description: "Paste a customer review and get a professional response draft instantly.",
    },
};

export default function ReviewResponseGeneratorPage() {
    return <ReviewResponseGeneratorClient />;
}
