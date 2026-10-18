import { LandingHero } from "@/components/marketing/landing-hero";
import { MultiLocationHeroVisual } from "@/components/marketing/feature-landing/visuals/multi-location-visuals";

export function PartnersHeroSection() {
    return (
        <LandingHero
            eyebrow="Better, together"
            title="Help local businesses put their best foot forward."
            description="Partner with Zyene to bring practical, affordable review management to the businesses you serve."
            media={{
                kind: "product",
                label: "Zyene businesses directory with the business switcher open",
                node: <div className="mi-visual"><MultiLocationHeroVisual /></div>,
            }}
            primary={{ label: "Book a demo", href: "/demo" }}
            secondary={{ label: "Explore the agency program", href: "/agencies" }}
        />
    );
}
