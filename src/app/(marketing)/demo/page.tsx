import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Book a Demo — Enterprise & Multi-Location | Zyene Reviews",
    description:
        "Schedule a live walkthrough with our sales team. See review automation, AI replies, white-label widgets, and enterprise SLAs for your brand or agency.",
    alternates: { canonical: "https://zyenereviews.com/demo" },
    openGraph: {
        title: "Book a Demo — Zyene Reviews",
        description: "Enterprise demo for multi-location brands, franchises, and agencies.",
        url: "https://zyenereviews.com/demo",
    },
    twitter: {
        card: "summary_large_image",
        title: "Book a Demo — Zyene Reviews",
        description: "Enterprise demo for multi-location brands, franchises, and agencies.",
    },
};

import PageView from "./page-view";

export default PageView;
