import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description:
        "Learn how Zyene Reviews collects, uses, and protects your personal data. We are committed to GDPR compliance, Google API Limited Use requirements, and transparent data practices.",
    alternates: { canonical: "https://zyenereviews.com/privacy" },
    openGraph: {
        title: "Privacy Policy — Zyene Reviews",
        description: "How Zyene Reviews handles your data: GDPR compliant, Google API Limited Use, secure OAuth.",
        url: "https://zyenereviews.com/privacy",
    },
    twitter: {
        card: "summary_large_image",
        title: "Privacy Policy — Zyene Reviews",
        description: "GDPR compliant, Google API Limited Use policy, secure OAuth. Learn how Zyene Reviews protects your data.",
    },
};

import PageView from "./page-view";

export default PageView;
