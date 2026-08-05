import type { CompetitorData } from "@/lib/comparisons/competitor-data";
import { ArrowRight, Check, X, ChevronRight, Sparkles, ShieldCheck } from "lucide-react";

export function CompareCompetitorWhereEachWinsSection({ data }: { data: CompetitorData }) {
    return (
        <section className="py-20 px-4 bg-background border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-12">Where each one wins</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Competitor wins */}
                        <div className="bg-card border border-border rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-muted rounded-xl flex items-center justify-center font-bold text-foreground text-sm shrink-0 size-10">
                                    {data.name.slice(0, 2)}
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Where {data.name} wins</h3>
                            </div>
                            <ul className="space-y-3">
                                {data.winsForCompetitor.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                        <Check className="text-muted-foreground shrink-0 mt-0.5 size-4" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Zyene Reviews wins */}
                        <div className="bg-card border-2 border-primary/30 rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-primary/10 rounded-xl flex items-center justify-center shrink-0 size-10">
                                    <ShieldCheck className="text-primary size-5" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Where Zyene Reviews wins</h3>
                            </div>
                            <ul className="space-y-3">
                                {data.winsForZyene.map((item, i) => (
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
