import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Zyene Reviews blog: review management and local SEO";

export default function OgImage() {
    return renderOgCard({
        eyebrow: "Blog",
        title: "Practical guides to more Google reviews",
        subtitle: "Reviews, replies and local SEO for local businesses.",
        image: "/images/blog/covers/why-google-reviews-matter-candid-v2.webp",
    });
}
