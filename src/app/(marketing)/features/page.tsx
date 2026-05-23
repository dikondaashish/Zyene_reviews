import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Features — Zyene Reviews",
    description:
        "Everything you need to own your online reputation: AI-powered review replies, review collection with Negative Feedback Shield, competitor tracking, local SEO dashboard, and more.",
    alternates: { canonical: "https://zyenereviews.com/features" },
    openGraph: {
        title: "Features — Zyene Reviews",
        description:
            "AI replies, Negative Feedback Shield, competitor tracking, local SEO, and more — all in one platform starting at $29.99/mo.",
        url: "https://zyenereviews.com/features",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Features — Zyene Reviews",
        description: "AI replies, Negative Feedback Shield, competitor tracking, local SEO — starting at $29.99/mo.",
    },
};

import PageView from "./page-view";

export default PageView;
