import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Resources, Free Guides for Local Business Owners",
    description: "Free, in-depth guides on Google reviews, local SEO, review request templates, and reputation management. Everything a local business owner needs in one place.",
    alternates: { canonical: "https://www.zyenereviews.com/resources" },
    openGraph: {
        title: "Resources, Free Guides for Local Business Owners",
        description: "Free in-depth guides on Google reviews, local SEO, negative review templates, and review request templates for local businesses.",
        url: "https://www.zyenereviews.com/resources",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Resources, Free Guides for Local Businesses",
        description: "Free in-depth guides on Google reviews, local SEO, and reputation management for local business owners.",
    },
};

import PageView from "./page-view";

export default PageView;
