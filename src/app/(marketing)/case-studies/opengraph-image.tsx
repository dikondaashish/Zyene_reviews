import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Review workflows for local businesses";

export default function OgImage() {
    return renderOgCard({
        eyebrow: "Workflows",
        title: "Review workflows for local businesses",
        subtitle: "How dental, restaurant, salon, HVAC and auto teams run their review routine.",
    });
}
