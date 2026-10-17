import { RESOURCE_MAP } from "@/lib/content/resource-data";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Free guide from Zyene Reviews";

export default async function OgImage({ params }: { params: Promise<{ guide: string }> }) {
    const { guide } = await params;
    const resource = RESOURCE_MAP[guide];
    return renderOgCard({
        eyebrow: "Free guide",
        title: resource?.title ?? "Free guide",
        subtitle: resource?.subtitle,
    });
}
