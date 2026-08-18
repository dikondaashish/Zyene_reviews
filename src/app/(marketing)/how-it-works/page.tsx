import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "How It Works",
    description:
        "Connect Google Business Profile, monitor reviews, collect more 5-stars with Negative Feedback Shield, and strengthen local search fundamentals in four steps.",
    alternates: { canonical: "https://www.zyenereviews.com/how-it-works" },
    openGraph: {
        title: "How It Works",
        description:
            "Connect, monitor, collect, and grow: four steps to more 5-star reviews and a stronger local presence.",
        url: "https://www.zyenereviews.com/how-it-works",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "How It Works",
        description: "Connect, monitor, collect, and grow, four steps to more 5-star reviews.",
    },
});

import PageView from "./page-view";

export default PageView;
