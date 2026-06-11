import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Agencies, White-Label Review Management",
    description:
        "Manage client reputations under your brand. Agency pricing tiers, white-label widgets, referral commissions, and multi-client dashboard roadmap.",
    alternates: { canonical: "https://www.zyenereviews.com/agencies" },
    openGraph: {
        title: "Agencies",
        description: "White-label review management for marketing and web agencies.",
        url: "https://www.zyenereviews.com/agencies",
    },
    twitter: {
        card: "summary_large_image",
        title: "Agencies",
        description: "White-label review management for marketing and web agencies.",
    },
});

import PageView from "./page-view";

export default PageView;
