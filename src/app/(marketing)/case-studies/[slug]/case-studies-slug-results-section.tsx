import { ArrowRight } from "lucide-react";
import { CASE_STUDY_MAP } from "@/lib/social-proof/case-study-data";

export function CaseStudiesSlugResultsSection({ study }: { study: (typeof CASE_STUDY_MAP)[string] }) {
    return (
        <section id="results" className="scroll-mt-24 border-b border-border py-16 sm:py-20">
            <div className="container mx-auto max-w-6xl px-4 sm:px-8">
                <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">03 / What changed</p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Illustrative results</h2>
                    </div>
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground">Composite planning examples, not audited results from a verified customer engagement.</p>
                </div>
                <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                    {study.metrics.map((m) => (
                        <div key={m.label} className="border-t-2 border-primary pt-4">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{m.label}</p>
                            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="line-through">{m.before}</span>
                                <ArrowRight className="size-4 text-primary" aria-hidden="true" />
                                <span className="text-2xl font-bold text-foreground">{m.after}</span>
                            </div>
                            <p className="mt-2 font-semibold text-primary">{m.change}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
