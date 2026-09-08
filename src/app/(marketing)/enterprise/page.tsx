import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Enterprise Review Management for Multi-Location Teams",
    description:
        "Coordinate review requests, private feedback follow-up, AI-assisted replies, and reporting with an Enterprise plan built around your business.",
    alternates: { canonical: "https://www.zyenereviews.com/enterprise" },
    openGraph: {
        title: "Zyene Reviews Enterprise",
        description: "Enterprise review management built around your locations, team, and reputation workflow.",
        url: "https://www.zyenereviews.com/enterprise",
    },
    twitter: {
        card: "summary_large_image",
        title: "Zyene Reviews Enterprise",
        description: "Enterprise review management built around your locations, team, and reputation workflow.",
    },
});

import PageView from "./page-view";

export default PageView;
