import type { IndustryData } from "@/lib/industries/industry-data";

/** The first pain point leads; the rest sit beneath it in a hairline grid. */
export function IndustriesIndustryPainPointsSection({ data }: { data: IndustryData }) {
    const [featured, ...supporting] = data.painPoints;

    return (
        <section className="marketing-section" aria-labelledby="ind-pain-heading">
            <div className="marketing-container ind-split">
                <div className="ind-split-head">
                    <p className="marketing-eyebrow">{data.name}</p>
                    <h2 id="ind-pain-heading">Where reviews get hard.</h2>
                    <p className="home-section-lede">The same few moments decide most of what customers write.</p>
                </div>
                <div>
                    <article className="ind-pain-lead">
                        <p className="ind-label">{featured.stat}</p>
                        <h3>{featured.title}</h3>
                        <p>{featured.description}</p>
                    </article>
                    <div className="ind-pain-rest">
                        {supporting.map((point) => (
                            <article key={point.title}>
                                <p className="ind-label">{point.stat}</p>
                                <h3>{point.title}</h3>
                                <p>{point.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
