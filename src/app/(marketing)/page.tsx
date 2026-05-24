import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Review Management for Local Businesses",
    description:
        "Monitor, respond to, and grow your Google reviews with AI. The only review management platform with a Negative Feedback Shield, routing bad reviews to private resolution before they hit Google. Starting at $29.99/mo, no annual contract.",
    alternates: {
        canonical: "https://zyenereviews.com/",
    },
    openGraph: {
        title: "Zyene Reviews, Review Management for Local Businesses",
        description:
            "AI-powered review management, competitor tracking, and local SEO for local businesses. Starting at $29.99/mo. 7-day free trial.",
        url: "https://zyenereviews.com/",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Zyene Reviews, Review Management for Local Businesses",
        description:
            "AI-powered review management, competitor tracking, and local SEO for local businesses. Starting at $29.99/mo. 7-day free trial.",
    },
};

import PageView from "./page-view";

export default PageView;
