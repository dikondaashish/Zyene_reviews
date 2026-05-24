import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Industries",
    description:
        "See how Zyene helps restaurants, dental, auto, salons, and more get more Google reviews with AI replies and the Negative Feedback Shield.",
    alternates: {
        canonical: "https://zyenereviews.com/industries",
        languages: {
            en: "https://zyenereviews.com/industries",
            es: "https://zyenereviews.com/es/industries",
        },
    },
    openGraph: {
        title: "Review Management for Every Industry",
        description:
            "From restaurants to dental practices to gyms, Zyene helps local businesses in every industry grow their reviews and protect their reputation.",
        url: "https://zyenereviews.com/industries",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Review Management for Every Industry",
        description: "From restaurants to gyms, Zyene helps local businesses in every industry grow their reviews.",
    },
};

import PageView from "./page-view";

export default PageView;
