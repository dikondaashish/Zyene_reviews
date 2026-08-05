import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import { COMPETITOR_MAP, COMPETITOR_SLUGS } from "@/lib/comparisons/competitor-data";

export function generateStaticParams() {
    return COMPETITOR_SLUGS.map((slug) => ({ competitor: slug }));
}

export async function generateMetadata(
    { params }: { params: Promise<{ competitor: string }> }
): Promise<Metadata> {
    const { competitor: slug } = await params;
    const data = COMPETITOR_MAP[slug];
    if (!data) return {};
    return mergeMarketingSocial({
        title: data.metaTitle,
        description: data.metaDescription,
        alternates: { canonical: `https://www.zyenereviews.com/compare/${slug}` },
        keywords: data.targetKeywords,
        openGraph: {
            title: data.metaTitle,
            description: data.metaDescription,
            url: `https://www.zyenereviews.com/compare/${slug}`,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: data.metaTitle,
            description: data.metaDescription,
        },
    });
}

import PageView from "./page-view";

export default PageView;
