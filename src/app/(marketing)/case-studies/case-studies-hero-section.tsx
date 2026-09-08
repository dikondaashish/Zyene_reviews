import { LandingHero } from "@/components/marketing/landing-hero";
import { CASE_STUDY_COMPOSITE_DISCLAIMER } from "@/lib/social-proof/case-study-data";

export function CaseStudiesHeroSection() {
    return (
        <LandingHero
            eyebrow="Illustrative workflows"
            title="See what a better review routine can look like."
            description="Explore composite workflows for restaurants, dental practices, home services, salons, and auto repair—from the first request to the next improvement.">
            <p className="max-w-2xl">{CASE_STUDY_COMPOSITE_DISCLAIMER}</p>
        </LandingHero>
    );
}
