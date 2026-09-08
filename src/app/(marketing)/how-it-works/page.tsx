import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "How It Works",
    description:
        "Connect your profile, invite fair feedback, respond with AI, and use review and request signals to improve your local reputation in four steps.",
    alternates: { canonical: "https://www.zyenereviews.com/how-it-works" },
    openGraph: {
        title: "How It Works",
        description:
            "Connect, monitor, collect, and improve: four steps to a better review routine and stronger local presence.",
        url: "https://www.zyenereviews.com/how-it-works",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "How It Works",
        description: "Connect, monitor, collect, and improve in four practical steps.",
    },
});

import PageView from "./page-view";

export default PageView;
