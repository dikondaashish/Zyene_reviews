import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Agency Review Management & White-Label Widgets",
    description:
        "Build a more consistent reputation service with branded review request flows and white-label review widgets for Enterprise client accounts.",
    alternates: { canonical: "https://www.zyenereviews.com/agencies" },
    openGraph: {
        title: "Review Management for Agencies",
        description: "Branded review request flows and white-label review widgets for agencies serving local businesses.",
        url: "https://www.zyenereviews.com/agencies",
    },
    twitter: {
        card: "summary_large_image",
        title: "Review Management for Agencies",
        description: "Branded review request flows and white-label review widgets for agencies serving local businesses.",
    },
});

import PageView from "./page-view";

export default PageView;
