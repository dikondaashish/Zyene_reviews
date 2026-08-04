import type { IndustryData } from "@/lib/industries/industry-data";

export function IndustriesIndustryPainPointsSection({ data }: { data: IndustryData }) {
    // Use the first pain point as the featured stat (left), remaining as supporting (right)
    const featured = data.painPoints[0];
    const supporting = data.painPoints.slice(1);

    return (
        <section className="py-20 px-4 bg-muted border-t border-border">
            <div className="container mx-auto max-w-5xl">
                <h2 className="text-3xl font-bold text-foreground text-center mb-3">
                    The reputation challenges {data.name.toLowerCase()} face
                </h2>
                <p className="text-muted-foreground text-center mb-14 max-w-xl mx-auto">
                    These aren&apos;t generic problems. They&apos;re specific to your industry.
                </p>

                <div className="grid lg:grid-cols-5 gap-10 items-start">
                    {/* Featured stat: 3/5 width */}
                    <div className="lg:col-span-3">
                        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">
                            {featured.stat}
                        </p>
                        <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-5 leading-tight">
                            {featured.title}
                        </h3>
                        <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                            {featured.description}
                        </p>
                    </div>

                    {/* Supporting stats: 2/5 width, stacked */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {supporting.map((point, i) => (
                            <div key={i} className="border-l-2 border-primary pl-5 py-1">
                                <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
                                    {point.stat}
                                </p>
                                <h3 className="text-lg font-bold text-foreground mb-2">
                                    {point.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {point.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
