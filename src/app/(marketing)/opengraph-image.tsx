import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Zyene Reviews: review management software for local businesses";

export default function OgImage() {
    return renderOgCard({
        eyebrow: "Review management software for local businesses",
        title: "More Google reviews. Less busywork.",
        subtitle: "Review requests, AI replies and insights in one workspace. From $29.99/month.",
        image: "/marketing/home/cafe-service.webp",
    });
}
