import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Book a Demo, Enterprise & Multi-Location",
    description:
        "Schedule a live walkthrough with our sales team. See review automation, AI replies, white-label widgets, and enterprise SLAs for your brand or agency.",
    alternates: { canonical: "https://www.zyenereviews.com/demo" },
    openGraph: {
        title: "Book a Demo",
        description: "Enterprise demo for multi-location brands, franchises, and agencies.",
        url: "https://www.zyenereviews.com/demo",
    },
    twitter: {
        card: "summary_large_image",
        title: "Book a Demo",
        description: "Enterprise demo for multi-location brands, franchises, and agencies.",
    },
});

import PageView from "./page-view";

export default PageView;
