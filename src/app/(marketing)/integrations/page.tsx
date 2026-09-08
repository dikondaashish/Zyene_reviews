import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Review Platform Integrations",
    description:
        "Sync Google, Facebook, and Yelp reviews. Trigger fair review requests from your workflow with Zyene’s REST API or generic inbound webhook.",
    alternates: { canonical: "https://www.zyenereviews.com/integrations" },
    openGraph: {
        title: "Review Platform Integrations",
        description:
            "Sync Google, Facebook, and Yelp reviews. Trigger review requests through Zyene’s REST API or generic inbound webhook.",
        url: "https://www.zyenereviews.com/integrations",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Review Platform Integrations",
        description: "Sync reviews and trigger review requests through your existing workflow.",
    },
});

import PageView from "./page-view";

export default PageView;
