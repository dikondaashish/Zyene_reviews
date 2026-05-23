import type { Metadata } from "next";
import { INDUSTRY_MAP, INDUSTRY_SLUGS } from "@/lib/phase3/industry-data";

export function generateStaticParams() {
    return INDUSTRY_SLUGS.map((slug) => ({ industry: slug }));
}

export async function generateMetadata(
    { params }: { params: Promise<{ industry: string }> }
): Promise<Metadata> {
    const { industry: slug } = await params;
    const data = INDUSTRY_MAP[slug];
    if (!data) return {};
    return {
        title: data.metaTitle,
        description: data.metaDescription,
        alternates: { canonical: `https://zyenereviews.com/industries/${slug}` },
        keywords: data.targetKeywords,
        openGraph: {
            title: data.metaTitle,
            description: data.metaDescription,
            url: `https://zyenereviews.com/industries/${slug}`,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: data.metaTitle,
            description: data.metaDescription,
        },
    };
}

import PageView from "./page-view";

export default PageView;
