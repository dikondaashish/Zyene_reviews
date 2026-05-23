import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cookbook",
    description: "Practical code examples for common Zyene Reviews integrations — triggering review requests from a POS, sending bulk campaigns via API, and automating replies.",
    alternates: { canonical: "https://zyenereviews.com/docs/cookbook" },
    openGraph: { title: "Cookbook — Zyene Reviews Docs", description: "Code examples: POS triggers, bulk review campaigns, API automation, and reply workflows.", url: "https://zyenereviews.com/docs/cookbook" },
    twitter: { card: "summary_large_image", title: "Cookbook — Zyene Reviews Docs", description: "Code examples: POS triggers, bulk campaigns, API automation, reply workflows." },
};

import PageView from "./page-view";

export default PageView;
