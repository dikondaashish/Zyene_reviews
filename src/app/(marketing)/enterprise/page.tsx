import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Enterprise, Custom Pricing, SLA, SSO & White-Label",
    description:
        "Enterprise review management for multi-location brands: unlimited locations, dedicated account manager, SSO, uptime SLA, and white-label widgets.",
    alternates: { canonical: "https://zyenereviews.com/enterprise" },
    openGraph: {
        title: "Zyene Reviews Enterprise",
        description: "Scale review operations across unlimited locations with SLA, SSO, and white-label.",
        url: "https://zyenereviews.com/enterprise",
    },
    twitter: {
        card: "summary_large_image",
        title: "Zyene Reviews Enterprise",
        description: "Scale review operations across unlimited locations with SLA, SSO, and white-label.",
    },
};

import PageView from "./page-view";

export default PageView;
