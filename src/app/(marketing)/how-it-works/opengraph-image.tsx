import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "How Zyene Reviews works";

export default function OgImage() {
    return renderOgCard({
        eyebrow: "How it works",
        title: "From a happy visit to a Google review in under a minute",
        subtitle: "Ask at the right moment, make reviewing effortless, reply in your voice.",
    });
}
