import type { Metadata } from "next";
import Link from "next/link";

// ─── Static Generation ────────────────────────────────────────────────────────


// ─── Metadata ─────────────────────────────────────────────────────────────────


// ─── Page ─────────────────────────────────────────────────────────────────────
import type { IndustryData } from "@/lib/phase3/industry-data";

export function IndustriesIndustryPainPointsSection({ data }: { data: IndustryData }) {
    return (
        <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-3">
                        The reputation challenges {data.name.toLowerCase()} face
                    </h2>
                    <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
                        These aren&apos;t generic problems. They&apos;re specific to your industry.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {data.painPoints.map((point, i) => (
                            <div key={i} className="bg-card border border-border rounded-2xl p-7">
                                <div className="inline-block bg-destructive/10 text-destructive text-xs font-bold px-3 py-1.5 rounded-full border border-destructive/20 mb-4">
                                    {point.stat}
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-3">{point.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{point.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
    );
}
