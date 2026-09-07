import { LandingHero } from "@/components/marketing/landing-hero";

export function FeaturesHeroSection() {
    return (
        <LandingHero
            eyebrow="The Zyene platform"
            title="Great reviews. Less busywork."
            description="Collect customer feedback, reply with AI, and understand your reputation in one connected workspace."
            image={{ src: "/marketing/home/local-owner-v2.webp", alt: "A local business owner reading customer feedback" }}
            primary={{ label: "Start free trial", href: "/signup" }}
            secondary={{ label: "Explore pricing", href: "/pricing" }}
        />
    );
}
