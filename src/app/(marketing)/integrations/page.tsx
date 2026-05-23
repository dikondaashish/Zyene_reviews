import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Integrations — Zyene Reviews",
    description:
        "Zyene Reviews connects with Google Business Profile, Facebook, Yelp, Zapier, Square, Clover, and more. Build custom integrations with our REST API.",
    alternates: { canonical: "https://zyenereviews.com/integrations" },
    openGraph: {
        title: "Integrations — Zyene Reviews",
        description:
            "Connect Zyene to Google, Facebook, Yelp, Zapier, Square, and 5,000+ apps. REST API for custom integrations.",
        url: "https://zyenereviews.com/integrations",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Integrations — Zyene Reviews",
        description: "Connect Zyene to Google, Facebook, Yelp, Zapier, Square, and 5,000+ apps.",
    },
};

import PageView from "./page-view";

export default PageView;
