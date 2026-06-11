import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "About Us",
    description:
        "Zyene Reviews helps local businesses monitor reviews, reply with AI, and grow reputation ethically. Built by Zyene, Inc. for affordable review management.",
    alternates: { canonical: "https://www.zyenereviews.com/about" },
    openGraph: {
        title: "About Zyene Reviews",
        description:
            "Zyene Reviews is a product of Zyene, Inc. We help local businesses monitor reviews, respond with AI, and grow their reputation, ethically and affordably.",
        url: "https://www.zyenereviews.com/about",
    },
    twitter: {
        card: "summary_large_image",
        title: "About Zyene Reviews",
        description:
            "Built by Zyene, Inc., making review management accessible and ethical for every local business. Starting at $29.99/mo.",
    },
});

import PageView from "./page-view";

export default PageView;
