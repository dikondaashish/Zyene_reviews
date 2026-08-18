import type { IndustryData } from "@/lib/industries/industry-data";

export function IndustriesIndustryUseCaseSection({ data }: { data: IndustryData }) {
    return (
        <section className="py-20 px-4 bg-primary/5 border-t border-primary/20">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-foreground">
                        An example workflow for a {data.nameSingular.toLowerCase()}
                    </h2>
                </div>

                <div className="bg-card border border-border rounded-lg p-8 md:p-12 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-6">
                        Illustrative workflow
                    </p>
                    <div className="grid gap-8 md:grid-cols-3">
                        <div>
                            <h3 className="font-semibold text-foreground mb-2">Starting point</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {data.useCase.startingPoint}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground mb-2">Workflow</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {data.useCase.workflow}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground mb-2">What to measure</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {data.useCase.measures}
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-4">
                    This is not a customer testimonial or a promised result.
                </p>
            </div>
        </section>
    );
}
