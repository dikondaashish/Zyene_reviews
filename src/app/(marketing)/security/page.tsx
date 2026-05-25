import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Security & Trust",
    description:
        "Zyene Reviews protects your data with multi-tenant RLS, 256-bit encryption, GDPR compliance, ethical review collection, and Google OAuth Limited Use.",
    alternates: { canonical: "https://www.zyenereviews.com/security" },
    openGraph: {
        title: "Security & Trust",
        description:
            "Multi-tenant RLS, encryption in transit and at rest, GDPR compliance, ethical review collection, and secure Google OAuth.",
        url: "https://www.zyenereviews.com/security",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Security & Trust",
        description: "Enterprise-grade security practices built for local business data, RLS, encryption, GDPR, no review gating.",
    },
};

import PageView from "./page-view";

export default PageView;
