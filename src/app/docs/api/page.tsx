import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "API Reference",
    description: "Zyene Reviews API reference. Authenticate with API keys, retrieve reviews, send review requests, read analytics, and connect your own workflows.",
    alternates: { canonical: "https://www.zyenereviews.com/docs/api" },
    openGraph: { title: "API Reference, Zyene Reviews Docs", description: "REST API reference for authentication, reviews, requests, analytics, and locations.", url: "https://www.zyenereviews.com/docs/api" },
    twitter: { card: "summary_large_image", title: "API Reference, Zyene Reviews", description: "REST API reference for auth, reviews, requests, analytics, and locations." },
});

import PageView from "./page-view";

export default PageView;
