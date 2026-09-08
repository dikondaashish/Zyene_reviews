import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import { CASE_STUDY_MAP, CASE_STUDY_SLUGS } from "@/lib/social-proof/case-study-data";

export function generateStaticParams() {
    return CASE_STUDY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;
    const study = CASE_STUDY_MAP[slug];
    if (!study) return {};
    const title = `Illustrative ${study.industry} Review Workflow`;
    const description = `An illustrative ${study.industry.toLowerCase()} review-management workflow using Zyene Reviews. This composite example is educational, not a verified customer testimonial.`;
    return mergeMarketingSocial({
        title,
        description,
        alternates: { canonical: `https://www.zyenereviews.com/case-studies/${slug}` },
        keywords: study.keywords,
        openGraph: {
            title,
            description,
            url: `https://www.zyenereviews.com/case-studies/${slug}`,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    });
}

import PageView from "./page-view";

export default PageView;
