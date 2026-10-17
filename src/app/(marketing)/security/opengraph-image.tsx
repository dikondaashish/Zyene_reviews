import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Security at Zyene Reviews";

export default function OgImage() {
    return renderOgCard({
        eyebrow: "Security",
        title: "How we protect your business and customer data",
        subtitle: "Access controls, encryption and data handling.",
    });
}
