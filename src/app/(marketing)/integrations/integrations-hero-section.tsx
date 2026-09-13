import { LandingHero } from "@/components/marketing/landing-hero";

export function IntegrationsHeroSection() {
    return (
        <LandingHero image={{ src: "/marketing/about/team-collaboration.webp", alt: "A team working together with their everyday business tools" }}
            eyebrow="Connect feedback to your workflow"
            title="Turn customer moments into review momentum"
            description="Sync Google, Facebook, and Yelp reviews in one workspace. Then use a REST API or generic inbound webhook to start configurable review-request workflows after a sale, booking, or completed service."
            primary={{ label: "Start free trial", href: "/signup" }}
            secondary={{ label: "API documentation", href: "/docs/api" }}
        />
    );
}
