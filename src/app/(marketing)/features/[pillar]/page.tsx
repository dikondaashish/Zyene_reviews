import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { FeaturePillarPageView } from "@/components/marketing/feature-pillar-page";
import {
    FEATURE_PILLAR_ALIASES,
    FEATURE_PILLAR_MAP,
    FEATURE_PILLAR_SLUGS,
    resolveFeaturePillarSlug,
} from "@/lib/growth/feature-pillars";

export function generateStaticParams() {
    return [
        ...FEATURE_PILLAR_SLUGS.map((pillar) => ({ pillar })),
        ...Object.keys(FEATURE_PILLAR_ALIASES).map((pillar) => ({ pillar })),
    ];
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ pillar: string }>;
}): Promise<Metadata> {
    const { pillar: raw } = await params;
    const slug = resolveFeaturePillarSlug(raw);
    if (!slug) return {};
    const data = FEATURE_PILLAR_MAP[slug];
    const path = `/features/${slug}`;
    return {
        title: data.metaTitle,
        description: data.metaDescription,
        alternates: { canonical: `https://www.zyenereviews.com${path}` },
        openGraph: {
            title: data.metaTitle,
            description: data.metaDescription,
            url: `https://www.zyenereviews.com${path}`,
        },
        twitter: {
            card: "summary_large_image",
            title: data.metaTitle,
            description: data.metaDescription,
        },
    };
}

export default async function FeaturePillarRoutePage({
    params,
}: {
    params: Promise<{ pillar: string }>;
}) {
    const { pillar: raw } = await params;
    if (raw in FEATURE_PILLAR_ALIASES) {
        permanentRedirect(`/features/${FEATURE_PILLAR_ALIASES[raw]}`);
    }
    const slug = resolveFeaturePillarSlug(raw);
    if (!slug) notFound();
    return <FeaturePillarPageView pillar={FEATURE_PILLAR_MAP[slug]} />;
}
