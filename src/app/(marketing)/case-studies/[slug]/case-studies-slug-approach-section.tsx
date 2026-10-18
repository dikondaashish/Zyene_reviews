import { Check } from "lucide-react";
import { CASE_STUDY_MAP } from "@/lib/social-proof/case-study-data";

export function CaseStudiesSlugApproachSection({ study }: { study: (typeof CASE_STUDY_MAP)[string] }) {
    return (
        <section className="marketing-section" aria-labelledby="case-study-approach-heading">
            <div className="marketing-container mi-split">
                <div className="mi-head">
                    <p className="marketing-eyebrow">The approach</p>
                    <h2 id="case-study-approach-heading">The solution</h2>
                    <p>In this example, the {study.industry.toLowerCase()} team sets up Zyene Reviews with a simple workflow that fits its existing job-completion process.</p>
                </div>
                <ul className="mi-list">
                    {study.solutionFeatures.map((feature) => (
                        <li key={feature}>
                            <Check size={18} aria-hidden="true" />
                            <p className="mi-list-title">{feature}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
