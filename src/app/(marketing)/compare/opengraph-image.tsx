import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Compare Zyene Reviews with Birdeye, Podium, NiceJob, GatherUp and Prosperly";

export default function OgImage() {
    return renderOgCard({
        eyebrow: "Compare",
        title: "Zyene Reviews vs. other review platforms",
        subtitle: "Features, limits and pricing side by side.",
    });
}
