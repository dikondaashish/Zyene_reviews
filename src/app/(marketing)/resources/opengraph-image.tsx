import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Free guides for local business owners";

export default function OgImage() {
    return renderOgCard({
        eyebrow: "Resources",
        title: "Free guides and templates for local businesses",
        subtitle: "Playbooks, review request templates and checklists.",
    });
}
