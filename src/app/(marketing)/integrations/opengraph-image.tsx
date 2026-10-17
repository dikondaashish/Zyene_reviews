import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Zyene Reviews integrations";

export default function OgImage() {
    return renderOgCard({
        eyebrow: "Integrations",
        title: "Connects to the places customers talk about you",
        subtitle: "Google Business Profile, Facebook, Yelp, Square and webhooks.",
    });
}
