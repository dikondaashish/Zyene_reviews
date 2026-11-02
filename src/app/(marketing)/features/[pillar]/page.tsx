import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import { notFound, permanentRedirect } from "next/navigation";
import { FeatureLandingView } from "@/components/marketing/feature-landing/feature-landing-view";
import { FEATURE_LANDING_CONTENT } from "@/components/marketing/feature-landing/content";
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
    return mergeMarketingSocial({
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
    }, { ownShareImage: true });
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
    const content = slug ? FEATURE_LANDING_CONTENT[slug] : undefined;
    if (!slug || !content) notFound();
    return <FeatureLandingView pillar={FEATURE_PILLAR_MAP[slug]} content={content} />;
}
