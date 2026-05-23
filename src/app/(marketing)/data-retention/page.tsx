import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Data Retention Policy",
    description:
        "Zyene Reviews data retention policy. How long we store your data, when it is deleted, and how to request deletion. GDPR and CCPA compliant.",
    alternates: { canonical: "https://zyenereviews.com/data-retention" },
    openGraph: {
        title: "Data Retention Policy, Zyene Reviews",
        description: "Data storage timelines, deletion schedules, and your rights under GDPR and CCPA.",
        url: "https://zyenereviews.com/data-retention",
    },
    twitter: {
        card: "summary_large_image",
        title: "Data Retention Policy, Zyene Reviews",
        description: "How long Zyene Reviews stores your data, when it is deleted, and your GDPR/CCPA rights.",
    },
};

import PageView from "./page-view";

export default PageView;
