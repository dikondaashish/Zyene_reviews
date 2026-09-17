import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Security & Trust",
    description:
        "Zyene Reviews protects your data with multi-tenant RLS, encryption, regional privacy controls, feedback workflows, and secure Google OAuth.",
    alternates: { canonical: "https://www.zyenereviews.com/security" },
    openGraph: {
        title: "Security & Trust",
        description:
            "Multi-tenant RLS, encryption in transit and at rest, regional privacy controls, feedback workflows, and secure Google OAuth.",
        url: "https://www.zyenereviews.com/security",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Security & Trust",
        description: "Enterprise-grade security practices built for local business data, RLS, encryption, privacy controls, and secure Google OAuth.",
    },
});

import PageView from "./page-view";

export default PageView;
