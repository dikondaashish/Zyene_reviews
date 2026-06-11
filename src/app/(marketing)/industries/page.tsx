import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Industries",
    description:
        "See how Zyene Reviews helps restaurants, dental, auto, salons, and more get more Google reviews with AI replies and the Negative Feedback Shield.",
    alternates: {
        canonical: "https://www.zyenereviews.com/industries",
        languages: {
            en: "https://www.zyenereviews.com/industries",
            es: "https://www.zyenereviews.com/es/industries",
        },
    },
    openGraph: {
        title: "Review Management for Every Industry",
        description:
            "From restaurants to dental practices to gyms, Zyene Reviews helps local businesses in every industry grow their reviews and protect their reputation.",
        url: "https://www.zyenereviews.com/industries",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Review Management for Every Industry",
        description: "From restaurants to gyms, Zyene Reviews helps local businesses in every industry grow their reviews.",
    },
});

import PageView from "./page-view";

export default PageView;
