import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service",
    description:
        "Zyene Reviews Terms of Service. Read our usage policies, subscription terms, 7-day trial conditions, TCPA/CAN-SPAM compliance, and acceptable use policy.",
    alternates: { canonical: "https://zyenereviews.com/terms" },
    openGraph: {
        title: "Terms of Service, Zyene Reviews",
        description: "Usage policies, subscription terms, and acceptable use policy for Zyene Reviews.",
        url: "https://zyenereviews.com/terms",
    },
    twitter: {
        card: "summary_large_image",
        title: "Terms of Service, Zyene Reviews",
        description: "Usage policies, subscription terms, 7-day trial conditions, and acceptable use policy for Zyene Reviews.",
    },
};

import PageView from "./page-view";

export default PageView;
