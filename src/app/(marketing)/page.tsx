import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Review Management for Local Businesses",
    description:
        "Monitor and respond to Google reviews with AI. Negative Feedback Shield gives low ratings a private feedback path while your team follows up. From $29.99/mo.",
    alternates: {
        canonical: "https://www.zyenereviews.com/",
    },
    openGraph: {
        title: "Zyene Reviews, Review Management for Local Businesses",
        description:
            "AI-powered review management, competitor tracking, and local SEO for local businesses. Starting at $29.99/mo. 7-day free trial.",
        url: "https://www.zyenereviews.com/",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Zyene Reviews, Review Management for Local Businesses",
        description:
            "AI-powered review management, competitor tracking, and local SEO for local businesses. Starting at $29.99/mo. 7-day free trial.",
    },
});

import PageView from "./page-view";

export default PageView;
