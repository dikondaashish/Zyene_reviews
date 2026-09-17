import { LandingHero } from "@/components/marketing/landing-hero";

export function AgenciesHeroSection() {
    return (
        <LandingHero
            eyebrow="Zyene for agencies"
            title="A better review routine for the clients who trust you."
            description="Give clients branded review request flows, private feedback follow-up, and white-label widgets for Enterprise accounts while you guide the strategy behind the work."
            image={{ src: "/marketing/about/team-collaboration.webp", alt: "An agency team collaborating around a table" }}
            primary={{ label: "Explore partnerships", href: "/partners" }}
            secondary={{ label: "Talk to our team", href: "/contact" }}
        />
    );
}
