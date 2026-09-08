import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Compare Zyene Reviews vs Review Platforms, 2026",
    description:
        "Compare Zyene Reviews vs Birdeye, Podium, NiceJob, GatherUp, and Prosperly: pricing, AI replies, review workflows, and buyer-fit tradeoffs.",
    alternates: { canonical: "https://www.zyenereviews.com/compare" },
    openGraph: {
        title: "Compare Zyene Reviews With Review Platforms, 2026",
        description:
            "Honest comparisons: Zyene Reviews vs Birdeye, Podium, NiceJob, GatherUp, and Prosperly. Pricing, review workflows, and buyer-fit tradeoffs.",
        url: "https://www.zyenereviews.com/compare",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Compare Zyene Reviews With Review Platforms, 2026",
        description: "Honest comparisons: Zyene Reviews vs Birdeye, Podium, NiceJob, GatherUp, and Prosperly.",
    },
});

import PageView from "./page-view";

export default PageView;
