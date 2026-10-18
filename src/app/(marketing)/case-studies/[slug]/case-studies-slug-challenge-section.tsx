import { CASE_STUDY_MAP } from "@/lib/social-proof/case-study-data";

export function CaseStudiesSlugChallengeSection({ study }: { study: (typeof CASE_STUDY_MAP)[string] }) {
    return (
        <section className="marketing-section" aria-labelledby="case-study-challenge-heading">
            <div className="marketing-container mi-split">
                <div className="mi-head">
                    <p className="marketing-eyebrow">The starting point</p>
                    <h2 id="case-study-challenge-heading">The challenge</h2>
                </div>
                <p className="cs-statement">{study.challenge}</p>
            </div>
        </section>
    );
}
