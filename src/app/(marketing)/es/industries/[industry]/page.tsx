import type { Metadata } from "next";
import {
    ES_INDUSTRY_LOCALIZED_SLUGS,
    getLocalizedIndustry,
} from "@/lib/phase8/localized-industries";

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
    return {
        title: data.metaTitle,
        description: data.metaDescription,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                en: `https://www.zyenereviews.com/industries/${data.industrySlug}`,
                es: canonicalUrl,
            },
        },
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
    };
}

import PageView from "./page-view";

export default PageView;
