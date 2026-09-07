import { LandingHero } from "@/components/marketing/landing-hero";

export function FeaturesHeroSection() {
    return (
        <LandingHero
            eyebrow="The Zyene platform"
            title="Great reviews. Less busywork."
            description="Collect customer feedback, reply with AI, and understand your reputation in one connected workspace."
            image={{ src: "/marketing/home/cafe-conversation.webp", alt: "A barista listening to a customer at a café counter" }}
            primary={{ label: "Start free trial", href: "/signup" }}
            secondary={{ label: "Explore pricing", href: "/pricing" }}
        />
    );
}
