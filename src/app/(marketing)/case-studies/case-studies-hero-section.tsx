import { LandingHero } from "@/components/marketing/landing-hero";
import { getIndustryImage } from "@/lib/industries/industry-imagery";
import { CASE_STUDY_COMPOSITE_DISCLAIMER } from "@/lib/social-proof/case-study-data";

export function CaseStudiesHeroSection() {
    const photo = getIndustryImage("restaurants");
    return (
        <LandingHero
            eyebrow="Illustrative workflows"
            title="See what a better review routine can look like."
            description="Explore composite workflows for restaurants, dental practices, home services, salons, and auto repair—from the first request to the next improvement."
            image={{ ...photo, caption: "Illustrative business photograph" }}
        >
            <div className="mi-takeaway" role="note">
                <p className="cs-note-title">Illustrative example. Not a real customer, and results are not typical or guaranteed.</p>
                <p>{CASE_STUDY_COMPOSITE_DISCLAIMER}</p>
            </div>
        </LandingHero>
    );
}
