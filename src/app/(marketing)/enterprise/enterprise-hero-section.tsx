import { LandingHero } from "@/components/marketing/landing-hero";

export function EnterpriseHeroSection() {
    return (
        <LandingHero
            eyebrow="Zyene for enterprise"
            title="A review routine that fits your locations."
            description="Set a clear standard for review requests, thoughtful responses, private feedback follow-up, and reporting—then tailor an Enterprise plan around your organization."
            image={{ src: "/marketing/about/team-collaboration.webp", alt: "A team planning work across business locations" }}
            primary={{ label: "Book a demo", href: "/demo" }}
            secondary={{ label: "Contact sales", href: "mailto:sales@zyenereviews.com" }}
        />
    );
}
