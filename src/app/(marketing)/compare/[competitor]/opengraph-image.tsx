import { COMPETITOR_MAP } from "@/lib/comparisons/competitor-data";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Zyene Reviews comparison";

export default async function OgImage({ params }: { params: Promise<{ competitor: string }> }) {
    const { competitor } = await params;
    const name = COMPETITOR_MAP[competitor]?.name ?? "other platforms";
    return renderOgCard({
        eyebrow: "Compare",
        title: `Zyene Reviews vs. ${name}`,
        subtitle: "Features, limits and pricing side by side. Zyene from $29.99/month.",
    });
}
