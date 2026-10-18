import { LandingHero } from "@/components/marketing/landing-hero";
import { MarketingGeoSummary } from "@/components/marketing/marketing-geo-summary";
import { getIndustryImage } from "@/lib/industries/industry-imagery";
import { CASE_STUDY_COMPOSITE_DISCLAIMER, CASE_STUDY_MAP } from "@/lib/social-proof/case-study-data";

export function CaseStudiesSlugHeaderSection({ study }: { study: (typeof CASE_STUDY_MAP)[string] }) {
    const resultSummary = study.resultsSummary.replace(/^Results in brief:\s*/i, "");
    const photo = getIndustryImage(study.industrySlug, study.industry);

    return (
        <>
            <LandingHero
                eyebrow={`${study.industry} · ${study.location}`}
                title={`Illustrative Example: ${study.headline}`}
                description={`Illustrative workflow: ${study.excerpt}`}
                image={{ src: photo.src, alt: `Illustrative ${study.industry.toLowerCase()} business photograph`, caption: "Illustrative business photograph" }}
                primary={{ label: "See the workflow", href: "#results" }}
                secondary={{ label: "All workflows", href: "/case-studies" }}
            >
                <div className="mi-takeaway" role="note">
                    <p className="cs-note-title">
                        Illustrative example. Not a real customer, and results are not typical or guaranteed.
                    </p>
                    <p>{CASE_STUDY_COMPOSITE_DISCLAIMER.replace(" - ", ": ")}</p>
                </div>
            </LandingHero>
            <section className="marketing-section mi-section-tight" aria-label="Illustrative summary">
                <div className="marketing-container">
                    <MarketingGeoSummary label="Illustrative summary">{resultSummary}</MarketingGeoSummary>
                    <p className="mi-table-note">{study.timeline} · {study.size}</p>
                </div>
            </section>
        </>
    );
}
