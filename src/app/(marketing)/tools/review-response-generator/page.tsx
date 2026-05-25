import type { Metadata } from "next";
import { ReviewResponseGeneratorClient } from "./review-response-generator-client";

export const metadata: Metadata = {
    title: "Free Review Response Template Generator",
    description:
        "Paste any customer review and get a professional response draft instantly. Free generator for local businesses — unlock more templates with your email.",
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
};

export default function ReviewResponseGeneratorPage() {
    return <ReviewResponseGeneratorClient />;
}
