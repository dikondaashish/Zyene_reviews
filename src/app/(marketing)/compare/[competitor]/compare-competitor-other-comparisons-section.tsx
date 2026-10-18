import type { CompetitorData } from "@/lib/comparisons/competitor-data";
import Link from "next/link";
import { COMPETITORS } from "@/lib/comparisons/competitor-data";
import { FEATURE_PILLAR_MAP } from "@/lib/growth/feature-pillars";

/** Related features, deep-dive guides and the other comparisons. */
export function CompareCompetitorOtherComparisonsSection({ data }: { data: CompetitorData }) {
    return (
        <section className="marketing-section mi-section-tight" aria-label="Related pages">
            <div className="marketing-container">
                <nav aria-label={`Zyene features relevant to ${data.name} users`} className="cmp-nav">
                    <p className="cmp-nav-label">Features to look at first</p>
                    <div className="mi-chips">
                        {data.relatedPillars.map((slug) => (
                            <Link key={slug} href={`/features/${slug}`}>{FEATURE_PILLAR_MAP[slug].navLabel}</Link>
                        ))}
                    </div>
                </nav>
                {data.guides && data.guides.length > 0 ? (
                    <nav aria-label={`${data.name} guides`} className="cmp-nav">
                        <p className="cmp-nav-label">Related {data.name} guides</p>
                        <div className="mi-chips">
                            {data.guides.map((guide) => (
                                <Link key={guide.href} href={guide.href}>{guide.label}</Link>
                            ))}
                        </div>
                    </nav>
                ) : null}
                <nav aria-label="Other comparisons" className="cmp-nav">
                    <p className="cmp-nav-label">Other comparisons</p>
                    <div className="mi-chips">
                        {COMPETITORS.filter((c) => c.slug !== data.slug).map((c) => (
                            <Link key={c.slug} href={`/compare/${c.slug}`}>Zyene Reviews vs {c.name}</Link>
                        ))}
                    </div>
                </nav>
            </div>
        </section>
    );
}
