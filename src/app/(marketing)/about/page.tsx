import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "About Us",
    description:
        "Zyene Reviews helps local businesses build a review routine: invite feedback, respond with AI assistance, follow up privately, and learn from trends.",
    alternates: { canonical: "https://www.zyenereviews.com/about" },
    openGraph: {
        title: "About Zyene Reviews",
        description:
            "Zyene Reviews helps local businesses invite feedback fairly, respond with AI assistance, follow up privately, and learn from trends.",
        url: "https://www.zyenereviews.com/about",
    },
    twitter: {
        card: "summary_large_image",
        title: "About Zyene Reviews",
        description:
            "Built by Zyene, Inc. for local businesses that want a fair, consistent review routine.",
    },
});

import PageView from "./page-view";

export default PageView;
