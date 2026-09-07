import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
export const metadata: Metadata = mergeMarketingSocial({
    title: "Free Review Tools for Local Businesses",
    description:
        "Free tools for local businesses: generate a Google review link, check your reputation score, and draft professional review responses. No signup required to try.",
    alternates: { canonical: "https://www.zyenereviews.com/tools" },
    openGraph: {
        title: "Free Review Tools",
        description: "Generate a Google review link, check your reputation score, and draft review responses, free, no signup required.",
        url: "https://www.zyenereviews.com/tools",
    },
    twitter: {
        card: "summary_large_image",
        title: "Free Review Tools",
        description: "Generate a Google review link, check your reputation score, and draft review responses, free.",
    },
});

export { default } from "@/app/(marketing)/tools/page-view";
