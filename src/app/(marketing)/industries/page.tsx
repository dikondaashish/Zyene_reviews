import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Review Management by Industry",
    description:
        "Explore Zyene workflows for restaurants, dental, auto, salons, and more: branded review requests, AI-assisted replies, private feedback, and useful trends.",
    alternates: {
        canonical: "https://www.zyenereviews.com/industries",
        languages: {
            en: "https://www.zyenereviews.com/industries",
            es: "https://www.zyenereviews.com/es/industries",
        },
    },
    openGraph: {
        title: "Review Management for Local Businesses",
        description:
            "Build a review routine for your industry: invite feedback, respond with AI assistance, follow up privately, and learn from trends.",
        url: "https://www.zyenereviews.com/industries",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Review Management for Local Businesses",
        description: "Branded review requests, AI-assisted replies, private feedback follow-up, and practical reputation insights for local businesses.",
    },
});

import PageView from "./page-view";

export default PageView;
