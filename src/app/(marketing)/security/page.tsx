import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Security & Trust — Zyene Reviews",
    description:
        "How Zyene Reviews protects your data: Row Level Security multi-tenant isolation, 256-bit encryption, GDPR compliance, no review gating, Google OAuth Limited Use, and transparent data retention.",
    alternates: { canonical: "https://zyenereviews.com/security" },
    openGraph: {
        title: "Security & Trust — Zyene Reviews",
        description:
            "Multi-tenant RLS, encryption in transit and at rest, GDPR compliance, ethical review collection, and secure Google OAuth.",
        url: "https://zyenereviews.com/security",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Security & Trust — Zyene Reviews",
        description: "Enterprise-grade security practices built for local business data — RLS, encryption, GDPR, no review gating.",
    },
};

import PageView from "./page-view";

export default PageView;
