import { LandingHero } from "@/components/marketing/landing-hero";

export function BlogHeroSection() {
    return (
        <LandingHero
            eyebrow="The local business journal"
            title="The Zyene Reviews Blog"
            description="Practical guides for earning trust, responding with care, and growing a local business."
            variant="directory"
            media={{ kind: "none" }}
        />
    );
}
