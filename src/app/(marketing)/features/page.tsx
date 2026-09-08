import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Features",
    description:
        "Invite fair feedback, manage reviews, reply with AI, and act on local insights in one connected review-management platform.",
    alternates: { canonical: "https://www.zyenereviews.com/features" },
    openGraph: {
        title: "Features",
        description:
            "Branded requests, AI-assisted replies, private feedback, competitor context, and local insights in one platform.",
        url: "https://www.zyenereviews.com/features",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Features",
        description: "Branded requests, AI replies, private feedback, and local insights in one platform.",
    },
});

import PageView from "./page-view";

export default PageView;
