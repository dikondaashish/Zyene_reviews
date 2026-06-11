import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Privacy Policy",
    description:
        "How Zyene Reviews collects, uses, and protects your data: GDPR compliance, Google API Limited Use, secure OAuth, and transparent privacy practices.",
    alternates: { canonical: "https://www.zyenereviews.com/privacy" },
    openGraph: {
        title: "Privacy Policy",
        description: "How Zyene Reviews handles your data: GDPR compliant, Google API Limited Use, secure OAuth.",
        url: "https://www.zyenereviews.com/privacy",
    },
    twitter: {
        card: "summary_large_image",
        title: "Privacy Policy",
        description: "GDPR compliant, Google API Limited Use policy, secure OAuth. Learn how Zyene Reviews protects your data.",
    },
});

import PageView from "./page-view";

export default PageView;
