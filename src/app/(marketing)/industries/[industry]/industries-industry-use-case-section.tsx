import type { Metadata } from "next";
import Link from "next/link";

// ─── Static Generation ────────────────────────────────────────────────────────


// ─── Metadata ─────────────────────────────────────────────────────────────────


// ─── Page ─────────────────────────────────────────────────────────────────────
import type { IndustryData } from "@/lib/phase3/industry-data";

export function IndustriesIndustryUseCaseSection({ data }: { data: IndustryData }) {
    return (
        <section className="py-20 px-4 bg-primary/5 border-t border-primary/20">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20 mb-4">
                            Real-world scenario
                        </div>
                        <h2 className="text-3xl font-bold text-foreground">
                            A {data.nameSingular.toLowerCase()} owner like you
                        </h2>
                    </div>
                    <div className="bg-card border border-border rounded-3xl p-10 shadow-sm">
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
                            <div className="bg-primary/10 rounded-2xl flex items-center justify-center text-2xl shrink-0 size-14">
                                {data.emoji}
                            </div>
                            <div>
                                <div className="text-xl font-bold text-foreground">{data.useCase.ownerName}</div>
                                <div className="text-sm text-muted-foreground">{data.useCase.ownerContext}</div>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-destructive mb-3">Before Zyene</div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{data.useCase.challengeBefore}</p>
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-3">What they did</div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{data.useCase.actionTaken}</p>
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wider text-chart-2 mb-3">Result</div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{data.useCase.resultAfter}</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-4">
                        This is an illustrative scenario based on typical platform results. Individual results vary.
                    </p>
                </div>
            </section>
    );
}
