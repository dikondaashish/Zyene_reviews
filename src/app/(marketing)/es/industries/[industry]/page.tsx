import type { Metadata } from "next";
import { industryAlternates } from "@/lib/seo/industry-alternates";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import {
    ES_INDUSTRY_LOCALIZED_SLUGS,
    getLocalizedIndustry,
} from "@/lib/industries/localized-industries";

export function generateStaticParams() {
    return ES_INDUSTRY_LOCALIZED_SLUGS.map((industry) => ({ industry }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ industry: string }>;
}): Promise<Metadata> {
    const { industry } = await params;
    const data = getLocalizedIndustry("es", industry);
    if (!data) return {};
    const canonicalUrl = `https://www.zyenereviews.com/es/industries/${industry}`;
    return mergeMarketingSocial({
        title: data.metaTitle,
        description: data.metaDescription,
        robots: {
            index: false,
            follow: true,
        },
        alternates: industryAlternates(data.industrySlug, "es"),
        openGraph: {
            title: data.metaTitle,
            description: data.metaDescription,
            url: canonicalUrl,
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
