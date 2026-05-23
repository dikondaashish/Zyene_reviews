import type { CompetitorData } from "@/lib/phase3/competitor-data";
import { ArrowRight, Check, X, ChevronRight, Sparkles, ShieldCheck } from "lucide-react";

export function CompareCompetitorWhoShouldUseWhichSection({ data }: { data: CompetitorData }) {
    return (
        <section className="py-20 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-12">Who should use which?</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-card border border-border rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-foreground mb-6">Choose {data.name} if you need:</h3>
                            <ul className="space-y-3">
                                {data.whoShouldUseCompetitor.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                        <ChevronRight className="text-muted-foreground shrink-0 mt-0.5 size-4" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-primary/5 border-2 border-primary/30 rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-foreground mb-6">Choose Zyene if you need:</h3>
                            <ul className="space-y-3">
                                {data.whoShouldUseZyene.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                        <Check className="text-primary shrink-0 mt-0.5 size-4" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
    );
}
