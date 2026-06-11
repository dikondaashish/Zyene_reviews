import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Compare Zyene Reviews vs Competitors, 2026",
    description:
        "Compare Zyene Reviews vs Birdeye, Podium, NiceJob, and GatherUp: review alerts, AI replies, Shield, messaging, and honest strengths by buyer type.",
    alternates: { canonical: "https://www.zyenereviews.com/compare" },
    openGraph: {
        title: "See How Zyene Reviews Compares, 2026",
        description:
            "Honest comparison matrix: Zyene Reviews vs Birdeye, Podium, NiceJob, GatherUp. Review-first vs CX, messaging, and survey platforms.",
        url: "https://www.zyenereviews.com/compare",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "See How Zyene Reviews Compares, 2026",
        description: "Honest comparisons: Zyene Reviews vs Birdeye, Podium, NiceJob, GatherUp.",
    },
});

import PageView from "./page-view";

export default PageView;
