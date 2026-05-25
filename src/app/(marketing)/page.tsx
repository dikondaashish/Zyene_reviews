import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Review Management for Local Businesses",
    description:
        "Monitor, respond to, and grow Google reviews with AI. Negative Feedback Shield routes unhappy customers privately before public posts. From $29.99/mo.",
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
};

import PageView from "./page-view";

export default PageView;
