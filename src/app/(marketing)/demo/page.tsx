import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Book a Review Management Demo",
    description:
        "Book a walkthrough of review requests, AI-assisted Google replies, private feedback follow-up, and reporting for your local business or locations.",
    alternates: { canonical: "https://www.zyenereviews.com/demo" },
    openGraph: {
        title: "Book a Demo",
        description: "See Zyene review requests, AI-assisted replies, private feedback follow-up, and reporting in action.",
        url: "https://www.zyenereviews.com/demo",
    },
    twitter: {
        card: "summary_large_image",
        title: "Book a Demo",
        description: "See Zyene review requests, AI-assisted replies, private feedback follow-up, and reporting in action.",
    },
});

import PageView from "./page-view";

export default PageView;
