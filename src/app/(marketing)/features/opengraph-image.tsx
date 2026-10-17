import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Zyene Reviews features";

export default function OgImage() {
    return renderOgCard({
        eyebrow: "Features",
        title: "Everything your reputation needs",
        subtitle: "Requests, review page, AI replies, insights and AI visibility.",
    });
}
