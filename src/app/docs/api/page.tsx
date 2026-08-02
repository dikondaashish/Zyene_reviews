import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "API Reference",
    description: "Zyene Reviews API reference. Authenticate with API keys, retrieve reviews, trigger campaigns, manage locations, and integrate with Zapier or your POS system.",
    alternates: { canonical: "https://www.zyenereviews.com/docs/api" },
    openGraph: { title: "API Reference, Zyene Reviews Docs", description: "Full REST API: authentication, reviews, campaigns, locations, Zapier integration.", url: "https://www.zyenereviews.com/docs/api" },
    twitter: { card: "summary_large_image", title: "API Reference, Zyene Reviews", description: "Full REST API reference: auth, reviews, campaigns, locations, Zapier." },
};

import PageView from "./page-view";

export default PageView;
