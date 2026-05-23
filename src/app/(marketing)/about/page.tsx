import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us",
    description:
        "Learn about Zyene Reviews, a reputation management platform built for local businesses. Our mission is to make online reputation management accessible and ethical for every local business owner.",
    alternates: { canonical: "https://zyenereviews.com/about" },
    openGraph: {
        title: "About Zyene Reviews",
        description:
            "Zyene Reviews is a product of Zyene, Inc. We help local businesses monitor reviews, respond with AI, and grow their reputation, ethically and affordably.",
        url: "https://zyenereviews.com/about",
    },
    twitter: {
        card: "summary_large_image",
        title: "About Zyene Reviews",
        description:
            "Built by Zyene, Inc., making review management accessible and ethical for every local business. Starting at $29.99/mo.",
    },
};

import PageView from "./page-view";

export default PageView;
