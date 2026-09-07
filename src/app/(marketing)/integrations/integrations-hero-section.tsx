import { LandingHero } from "@/components/marketing/landing-hero";

export function IntegrationsHeroSection() {
    return (
        <LandingHero image={{ src: "/marketing/about/team-collaboration.png", alt: "A team working together with their everyday business tools" }}
            eyebrow="Keep your tools. Connect your reviews."
            title="Less switching. More connected."
            description="Connect your review platforms and business tools, and keep customer feedback moving through the workflow you already use."
            primary={{ label: "Start free trial", href: "/signup" }}
            secondary={{ label: "API documentation", href: "/docs/api" }}
        />
    );
}
