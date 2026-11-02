import type { Metadata } from "next";

import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "SMS Consent Requirements",
    description:
        "How Zyene Reviews requires businesses to collect express consent before sending SMS review requests or account alerts.",
    alternates: { canonical: "https://www.zyenereviews.com/sms-consent" },
    openGraph: {
        title: "Zyene Reviews SMS Consent Requirements",
        description:
            "Review the consent, message content, opt-out, and recordkeeping requirements for Zyene Reviews SMS workflows.",
        url: "https://www.zyenereviews.com/sms-consent",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Zyene Reviews SMS Consent Requirements",
        description:
            "How businesses collect express consent before sending SMS review requests through Zyene Reviews.",
    },
});

import PageView from "./page-view";

export default PageView;
