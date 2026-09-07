import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Integrations",
    description:
        "Zyene Reviews connects with Google Business Profile, Facebook, Yelp, Zapier, and Square. Use the REST API or generic webhook for custom workflows.",
    alternates: { canonical: "https://www.zyenereviews.com/integrations" },
    openGraph: {
        title: "Integrations",
        description:
            "Connect Zyene to Google, Facebook, Yelp, Zapier, and Square. Use the REST API for custom integrations.",
        url: "https://www.zyenereviews.com/integrations",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Integrations",
        description: "Connect Zyene to Google, Facebook, Yelp, Zapier, and Square.",
    },
});

import PageView from "./page-view";

export default PageView;
