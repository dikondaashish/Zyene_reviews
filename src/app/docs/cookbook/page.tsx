import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Cookbook",
    description: "Practical code examples for sending review requests, using the generic webhook, reading reviews, and pulling analytics from the Zyene Reviews API.",
    alternates: { canonical: "https://www.zyenereviews.com/docs/cookbook" },
    openGraph: { title: "Cookbook, Zyene Reviews Docs", description: "Code examples for review requests, webhooks, API automation, and analytics.", url: "https://www.zyenereviews.com/docs/cookbook" },
    twitter: { card: "summary_large_image", title: "Cookbook, Zyene Reviews Docs", description: "Code examples for review requests, webhooks, API automation, and analytics." },
});

import PageView from "./page-view";

export default PageView;
