import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Agencies, White-Label Review Management | Zyene Reviews",
    description:
        "Manage client reputations under your brand. Agency pricing tiers, white-label widgets, referral commissions, and multi-client dashboard roadmap.",
    alternates: { canonical: "https://zyenereviews.com/agencies" },
    openGraph: {
        title: "Agencies, Zyene Reviews",
        description: "White-label review management for marketing and web agencies.",
        url: "https://zyenereviews.com/agencies",
    },
    twitter: {
        card: "summary_large_image",
        title: "Agencies, Zyene Reviews",
        description: "White-label review management for marketing and web agencies.",
    },
};

import PageView from "./page-view";

export default PageView;
