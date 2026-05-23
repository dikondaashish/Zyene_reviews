import type { Metadata } from "next";
import { RESOURCE_MAP, RESOURCE_SLUGS } from "@/lib/phase4/resource-data";

export function generateStaticParams() {
    return RESOURCE_SLUGS.map((guide) => ({ guide }));
}

export async function generateMetadata(
    { params }: { params: Promise<{ guide: string }> }
): Promise<Metadata> {
    const { guide } = await params;
    const resource = RESOURCE_MAP[guide];
    if (!resource) return {};
    return {
        title: resource.metaTitle,
        description: resource.metaDescription,
        alternates: { canonical: `https://zyenereviews.com/resources/${guide}` },
        keywords: resource.keywords,
        openGraph: {
            title: resource.metaTitle,
            description: resource.metaDescription,
            url: `https://zyenereviews.com/resources/${guide}`,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: resource.metaTitle,
            description: resource.metaDescription,
        },
    };
}

import PageView from "./page-view";

export default PageView;
