import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog, Review Management & Local SEO for Local Businesses",
    description: "Practical guides on Google reviews, local SEO, responding to reviews, and reputation management. Written for local business owners who want to grow.",
    alternates: { canonical: "https://www.zyenereviews.com/blog" },
    openGraph: {
        title: "Blog, Review Management & Local SEO Tips",
        description: "Practical guides on Google reviews, local SEO, responding to reviews, and reputation management for local business owners.",
        url: "https://www.zyenereviews.com/blog",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Blog, Review Management & Local SEO Tips",
        description: "Practical guides on Google reviews, local SEO, and reputation management for local business owners.",
    },
};

import PageView from "./page-view";

export default PageView;
