import type { IndustryData } from "@/lib/industries/industry-data";

/** Illustrative routine in three columns. Not a case study, and labelled as such. */
export function IndustriesIndustryUseCaseSection({ data }: { data: IndustryData }) {
    const steps = [
        { title: "Starting point", copy: data.useCase.startingPoint },
        { title: "A better routine", copy: data.useCase.workflow },
        { title: "What to measure", copy: data.useCase.measures },
    ];

    return (
        <section className="marketing-section" aria-labelledby="ind-usecase-heading">
            <div className="marketing-container">
                <div className="home-section-head">
                    <p className="marketing-eyebrow">An illustrative workflow</p>
                    <h2 id="ind-usecase-heading">What a better week looks like.</h2>
                </div>
                <ol className="ind-columns">
                    {steps.map((step) => (
                        <li key={step.title}>
                            <h3>{step.title}</h3>
                            <p>{step.copy}</p>
                        </li>
                    ))}
                </ol>
                <p className="ind-footnote">This is not a customer testimonial or a promised result.</p>
            </div>
        </section>
    );
}
