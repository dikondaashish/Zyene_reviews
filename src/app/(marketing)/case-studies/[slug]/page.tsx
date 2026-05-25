import type { Metadata } from "next";
import { CASE_STUDY_MAP, CASE_STUDY_SLUGS } from "@/lib/phase5/case-study-data";

export function generateStaticParams() {
    return CASE_STUDY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;
    const study = CASE_STUDY_MAP[slug];
    if (!study) return {};
    return {
        title: study.metaTitle,
        description: study.metaDescription,
        alternates: { canonical: `https://www.zyenereviews.com/case-studies/${slug}` },
        keywords: study.keywords,
        openGraph: {
            title: study.metaTitle,
            description: study.metaDescription,
            url: `https://www.zyenereviews.com/case-studies/${slug}`,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: study.metaTitle,
            description: study.metaDescription,
        },
    };
}

import PageView from "./page-view";

export default PageView;
