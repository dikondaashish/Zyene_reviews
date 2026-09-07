import { LandingHero } from "@/components/marketing/landing-hero";
import { CASE_STUDY_COMPOSITE_DISCLAIMER } from "@/lib/social-proof/case-study-data";

export function CaseStudiesHeroSection() {
    return (
        <LandingHero
            eyebrow="Business stories"
            title="See what a better review routine looks like."
            description="Explore illustrative workflows for restaurants, dental practices, home services, salons, and auto repair.">
            <p className="max-w-2xl">{CASE_STUDY_COMPOSITE_DISCLAIMER}</p>
        </LandingHero>
    );
}
