import { LandingHero } from "@/components/marketing/landing-hero";

export function FeaturesHeroSection() {
    return (
        <LandingHero
            eyebrow="The Zyene platform"
            title="A complete review routine. From the ask to the next action."
            description="Invite customer feedback with branded requests, keep every review in one place, reply with AI, and use clear signals to improve the next customer experience."
            image={{ src: "/marketing/home/cafe-conversation.webp", alt: "A barista listening to a customer at a café counter" }}
            primary={{ label: "Start free trial", href: "/signup" }}
            secondary={{ label: "Explore pricing", href: "/pricing" }}
        />
    );
}
