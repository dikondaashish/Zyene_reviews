import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Zyene Reviews pricing from $29.99/month";

export default function OgImage() {
    return renderOgCard({
        eyebrow: "Pricing",
        title: "Plans from $29.99/month",
        subtitle: "7-day free trial. No contracts and no cancellation fees.",
    });
}
