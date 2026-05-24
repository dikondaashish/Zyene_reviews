import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Customer Case Studies, Real Results for Local Businesses",
    description:
        "See how dental practices, restaurants, salons, HVAC companies, and auto shops grew Google reviews and ratings with Zyene Reviews, with before/after metrics.",
    alternates: { canonical: "https://zyenereviews.com/case-studies" },
    openGraph: {
        title: "Customer Case Studies",
        description: "Before/after metrics from local businesses using Zyene Reviews for review management and reputation growth.",
        url: "https://zyenereviews.com/case-studies",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Customer Case Studies",
        description: "Real outcomes: more Google reviews, higher ratings, faster response times.",
    },
};

import PageView from "./page-view";

export default PageView;
