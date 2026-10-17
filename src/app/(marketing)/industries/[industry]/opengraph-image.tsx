import { INDUSTRY_MAP } from "@/lib/industries/industry-data";
import { getIndustryImage } from "@/lib/industries/industry-imagery";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Zyene Reviews for your industry";

export default async function OgImage({ params }: { params: Promise<{ industry: string }> }) {
    const { industry } = await params;
    const name = INDUSTRY_MAP[industry]?.name ?? "local businesses";
    return renderOgCard({
        eyebrow: "Industries",
        title: `Review management for ${name.toLowerCase()}`,
        subtitle: "Review requests, AI replies and private feedback. From $29.99/month.",
        image: getIndustryImage(industry).src,
    });
}
