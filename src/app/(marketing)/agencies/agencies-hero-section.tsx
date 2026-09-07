import { LandingHero } from "@/components/marketing/landing-hero";

export function AgenciesHeroSection() {
    return (
        <LandingHero
            eyebrow="Zyene for agencies"
            title="Their reputation. Your expertise."
            description="Manage client reviews, offer branded widgets, and build a reputation service that grows with your agency."
            image={{ src: "/marketing/about/team-collaboration.png", alt: "An agency team collaborating around a table" }}
            primary={{ label: "Explore partnerships", href: "/partners" }}
            secondary={{ label: "Talk to our team", href: "/contact" }}
        />
    );
}
