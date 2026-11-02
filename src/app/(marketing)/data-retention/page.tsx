import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Data Retention Policy",
    description:
        "Zyene Reviews data retention policy. How long we store your data, when it is deleted, and how to request deletion. GDPR and CCPA compliant.",
    alternates: { canonical: "https://www.zyenereviews.com/data-retention" },
    openGraph: {
        title: "Data Retention Policy",
        description: "Data storage timelines, deletion schedules, and your rights under GDPR and CCPA.",
        url: "https://www.zyenereviews.com/data-retention",
    },
    twitter: {
        card: "summary_large_image",
        title: "Data Retention Policy",
        description: "How long Zyene Reviews stores your data, when it is deleted, and your GDPR/CCPA rights.",
    },
});

import PageView from "./page-view";

export default PageView;
