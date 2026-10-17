import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Zyene Reviews Help Center";

export default function OgImage() {
    return renderOgCard({
        eyebrow: "Help Center",
        title: "Answers for every step of your review routine",
        subtitle: "Setup guides, how-tos and troubleshooting.",
    });
}
