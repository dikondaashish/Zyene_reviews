import { LandingHero } from "@/components/marketing/landing-hero";
import { SMALL_BUSINESS_ANSWER } from "@/lib/marketing/small-business-content";

export function SmallBusinessHeroSection() {
    return (
        <LandingHero
            eyebrow="Zyene for small business"
            title="Review management software for small business"
            description={SMALL_BUSINESS_ANSWER}
            image={{ src: "/marketing/home/storefront-candid-v2.webp", alt: "Customers at outdoor tables in front of a small local café" }}
            primary={{ label: "Start free trial", href: "/signup" }}
            secondary={{ label: "See pricing", href: "/pricing" }}
        />
    );
}
