import { LandingHero } from "@/components/marketing/landing-hero";

export function HelpHeroSection() {
    return (
        <LandingHero
            eyebrow="Zyene Help Center"
            title="A little guidance goes a long way."
            description="Find setup guides, answers, and practical tips to keep your review workflows running smoothly."
            primary={{ label: "Email support", href: "mailto:support@zyenereviews.com" }} />
    );
}
