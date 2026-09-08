import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Illustrative Review Workflows for Local Businesses",
    description:
        "Explore illustrative review-management workflows for dental, restaurant, salon, HVAC, and auto teams. Composite examples are educational.",
    alternates: { canonical: "https://www.zyenereviews.com/case-studies" },
    openGraph: {
        title: "Illustrative Review Workflows",
        description: "Composite workflow examples for local teams building a better review routine.",
        url: "https://www.zyenereviews.com/case-studies",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Illustrative Review Workflows",
        description: "Composite workflow examples for local teams building a better review routine.",
    },
});

import PageView from "./page-view";

export default PageView;
