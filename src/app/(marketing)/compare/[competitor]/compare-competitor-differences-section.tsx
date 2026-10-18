import type { CompetitorData } from "@/lib/comparisons/competitor-data";

/** The sourced differences: each row cites the competitor's own page and the date it was read. */
export function CompareCompetitorDifferencesSection({ data }: { data: CompetitorData }) {
    return (
        <section className="marketing-section" aria-labelledby="compare-differences-heading">
            <div className="marketing-container">
                <div className="mi-head">
                    <p className="marketing-eyebrow">Zyene Reviews vs {data.name}</p>
                    <h2 id="compare-differences-heading">{data.differences.length} differences that matter</h2>
                    <p>
                        Each {data.name} fact comes from {data.name}&apos;s own website, read on {data.pricingSource.checkedOn}. Vendors change plans, so check the linked page before you buy.
                    </p>
                </div>
                <ol className="cmp-diff">
                    {data.differences.map((row) => (
                        <li key={row.topic}>
                            <h3>{row.topic}</h3>
                            <div>
                                <p className="cmp-diff-label">{data.name}</p>
                                <p className="cmp-diff-text">{row.competitor}</p>
                                <a href={row.source.href} target="_blank" rel="noopener noreferrer" className="cmp-diff-source">
                                    Source: {row.source.label}, checked {data.pricingSource.checkedOn}
                                </a>
                            </div>
                            <div>
                                <p className="cmp-diff-label">Zyene Reviews</p>
                                <p className="cmp-diff-text">{row.zyene}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
