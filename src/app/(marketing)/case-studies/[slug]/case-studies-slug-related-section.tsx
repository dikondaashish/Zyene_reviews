import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IndustryIcon } from "@/lib/industries/industry-icons";
import { CASE_STUDY_MAP } from "@/lib/social-proof/case-study-data";

type Study = (typeof CASE_STUDY_MAP)[string];

export function CaseStudiesSlugRelatedSection({ study, related }: { study: Study; related: Study[] }) {
    return (
        <section className="marketing-section" aria-labelledby="case-study-related-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Illustrative examples</p>
                    <h2 id="case-study-related-heading">More case studies</h2>
                </div>
                <ul className="mi-cards" data-cols="2">
                    {related.map((r) => (
                        <li key={r.slug} className="flex">
                            <Link href={`/case-studies/${r.slug}`} className="mi-card w-full">
                                <IndustryIcon slug={r.industrySlug} size={20} />
                                <p className="mi-card-meta">{r.industry}</p>
                                <h3>{r.company}</h3>
                                <p>{r.excerpt}</p>
                                <span className="home-text-link">
                                    Explore workflow <ArrowRight size={14} aria-hidden="true" />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
                <nav aria-label="More from Zyene Reviews" className="mi-chips cs-related-links">
                    <Link href="/case-studies">All workflows</Link>
                    <Link href={`/industries/${study.industrySlug}`}>See Zyene Reviews for {study.industry}</Link>
                </nav>
            </div>
        </section>
    );
}
