import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CASE_STUDIES } from "@/lib/social-proof/case-study-data";
import { IndustryIcon } from "@/lib/industries/industry-icons";

export function CaseStudiesGridSection() {
    return (
        <section className="marketing-section" aria-labelledby="case-studies-grid-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Illustrative examples</p>
                    <h2 id="case-studies-grid-heading">Pick a workflow to explore.</h2>
                </div>
                <ul className="mi-cards">
                    {CASE_STUDIES.map((study) => (
                        <li key={study.slug} className="flex">
                            <Link href={`/case-studies/${study.slug}`} className="mi-card w-full">
                                <IndustryIcon slug={study.industrySlug} size={20} />
                                <p className="mi-card-meta">{study.industry} · illustrative scenario</p>
                                <h3>{study.headline}</h3>
                                <p>{study.excerpt}</p>
                                {study.metrics.length > 0 && (
                                    <dl className="cs-metrics">
                                        {study.metrics.slice(0, 2).map((m) => (
                                            <div key={m.label}>
                                                <dt className="mi-card-meta">{m.label}</dt>
                                                <dd className="mi-card-value">{m.before} → {m.after}</dd>
                                                <dd className="mi-card-meta">{m.change}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                )}
                                <span className="home-text-link">
                                    Explore workflow <ArrowRight size={14} aria-hidden="true" />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
