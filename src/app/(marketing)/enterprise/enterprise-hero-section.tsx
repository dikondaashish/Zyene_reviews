import { LandingHero } from "@/components/marketing/landing-hero";

export function EnterpriseHeroSection() {
    return (
        <LandingHero
            eyebrow="Zyene for enterprise"
            title="Every location. One clear picture."
            description="Bring reviews, teams, and reporting together with a plan built around your locations and the support you need."
            image={{ src: "/marketing/about/team-collaboration.png", alt: "A team planning work across business locations" }}
            primary={{ label: "Book a demo", href: "/demo" }}
            secondary={{ label: "Contact sales", href: "mailto:sales@zyenereviews.com" }}
        />
    );
}
