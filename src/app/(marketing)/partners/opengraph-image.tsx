import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Zyene Reviews partners";

export default function OgImage() {
    return renderOgCard({
        eyebrow: "Partners",
        title: "Grow with Zyene Reviews",
        subtitle: "Programs for agencies, POS platforms and co-marketing.",
    });
}
