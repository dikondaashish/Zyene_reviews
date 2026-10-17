import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "About Zyene Reviews";

export default function OgImage() {
    return renderOgCard({
        eyebrow: "About Zyene Reviews",
        title: "Built for the places people come back to",
        subtitle: "Review management made for owner-operated local businesses.",
        image: "/marketing/about/team-collaboration-candid-v2.webp",
    });
}
