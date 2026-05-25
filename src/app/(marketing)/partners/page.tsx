import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Partners, Agencies, POS, Zapier & More",
    description:
        "Partner with Zyene Reviews: agency referral program, POS marketplace integrations, Zapier automation, and local business association co-marketing.",
    alternates: { canonical: "https://www.zyenereviews.com/partners" },
    openGraph: {
        title: "Partners",
        description: "Agency partners, POS integrations, Zapier, and growth partnerships for local business software.",
        url: "https://www.zyenereviews.com/partners",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Partners",
        description: "Agency referral program, POS integrations, and strategic partnerships.",
    },
};

import PageView from "./page-view";

export default PageView;
