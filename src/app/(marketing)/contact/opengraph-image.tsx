import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Contact Zyene Reviews";

export default function OgImage() {
    return renderOgCard({
        eyebrow: "Contact",
        title: "Talk to a real person",
        subtitle: "Sales, support and partnerships for Zyene Reviews.",
    });
}
