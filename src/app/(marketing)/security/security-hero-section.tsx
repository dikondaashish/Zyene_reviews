import { LandingHero } from "@/components/marketing/landing-hero";

export function SecurityHeroSection() {
    return (
        <LandingHero
            eyebrow="Security & trust"
            title="Your reputation is in good hands."
            description="Learn how Zyene Reviews protects business data, manages access, and connects securely to your review platforms."
            primary={{ label: "Data retention policy", href: "/data-retention" }}
            secondary={{ label: "Privacy policy", href: "/privacy" }} />
    );
}
