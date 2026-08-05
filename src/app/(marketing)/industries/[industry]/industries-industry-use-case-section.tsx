import { TrendingUp } from "lucide-react";
import type { IndustryData } from "@/lib/industries/industry-data";

export function IndustriesIndustryUseCaseSection({ data }: { data: IndustryData }) {
    const initial = data.useCase.ownerName.charAt(0).toUpperCase();

    return (
        <section className="py-20 px-4 bg-primary/5 border-t border-primary/20">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-foreground">
                        A {data.nameSingular.toLowerCase()} owner like you
                    </h2>
                </div>

                <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar */}
                        <div className="shrink-0">
                            <div className="bg-primary text-primary-foreground rounded-full size-16 flex items-center justify-center text-2xl font-bold">
                                {initial}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {/* Quote */}
                            <blockquote className="text-xl md:text-2xl font-medium text-foreground leading-relaxed mb-6">
                                &ldquo;{data.useCaseQuote}&rdquo;
                            </blockquote>

                            {/* Byline */}
                            <div className="mb-8">
                                <p className="font-bold text-foreground">
                                    {data.useCase.ownerName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {data.useCase.ownerContext}
                                </p>
                            </div>

                            {/* Result highlights */}
                            <div className="flex flex-wrap gap-3">
                                {data.useCaseHighlights.map((highlight) => (
                                    <div
                                        key={highlight}
                                        className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-2 rounded-full"
                                    >
                                        <TrendingUp className="size-3.5" />
                                        {highlight}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-4">
                    Illustrative scenario based on typical platform results.
                </p>
            </div>
        </section>
    );
}
