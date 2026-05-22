import type { Metadata } from "next";
import { ReviewLinkGeneratorClient } from "./review-link-generator-client";

export const metadata: Metadata = {
    title: "Free Google Review Link Generator | Zyene Reviews",
    description: "Generate a direct Google review link for your business. Free tool for local business owners.",
    alternates: { canonical: "https://zyenereviews.com/tools/review-link-generator" },
};

export default function ReviewLinkGeneratorPage() {
    return <ReviewLinkGeneratorClient />;
}
