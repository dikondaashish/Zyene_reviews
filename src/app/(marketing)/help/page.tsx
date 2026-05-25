import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Help Center",
    description: "Find guides and answers to common questions about Zyene Reviews. Getting started, reviews, campaigns, analytics, billing, and integrations.",
    alternates: { canonical: "https://www.zyenereviews.com/help" },
    openGraph: {
        title: "Help Center",
        description: "Guides and answers for Getting Started, Reviews, Campaigns, Analytics, Billing, and Integrations.",
        url: "https://www.zyenereviews.com/help",
    },
    twitter: {
        card: "summary_large_image",
        title: "Help Center",
        description: "Guides and answers for Getting Started, Reviews, Campaigns, Analytics, Billing, and Integrations.",
    },
};

import PageView from "./page-view";

export default PageView;
