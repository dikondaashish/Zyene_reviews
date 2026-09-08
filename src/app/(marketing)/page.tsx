import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Review Management for Local Businesses",
    description:
        "Send fair review requests, manage Google, Facebook, and Yelp feedback, reply with AI, and use Negative Feedback Shield for private follow-up. From $29.99/mo.",
    alternates: {
        canonical: "https://www.zyenereviews.com/",
    },
    openGraph: {
        title: "Zyene Reviews, Review Management for Local Businesses",
        description:
            "Fair review requests, AI-assisted Google replies, competitor context, and local insights for local businesses. From $29.99/mo.",
        url: "https://www.zyenereviews.com/",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Zyene Reviews, Review Management for Local Businesses",
        description: "A fair, repeatable review routine for local businesses. From $29.99/mo.",
    },
});

import PageView from "./page-view";

export default PageView;
