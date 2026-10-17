import { FEATURE_PILLAR_MAP, resolveFeaturePillarSlug } from "@/lib/growth/feature-pillars";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Zyene Reviews feature";

export default async function OgImage({ params }: { params: Promise<{ pillar: string }> }) {
    const { pillar } = await params;
    const slug = resolveFeaturePillarSlug(pillar);
    const page = slug ? FEATURE_PILLAR_MAP[slug] : null;
    return renderOgCard({
        eyebrow: "Zyene Reviews features",
        title: page?.title ?? "Review management for local businesses",
        subtitle: page?.tagline,
    });
}
