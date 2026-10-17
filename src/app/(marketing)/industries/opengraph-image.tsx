import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Review management for every local business";

export default function OgImage() {
    return renderOgCard({
        eyebrow: "Industries",
        title: "Review management for every local business",
        subtitle: "Restaurants, dental, salons, auto repair, home services and more.",
        image: "/images/industries/restaurant-guests.webp",
    });
}
