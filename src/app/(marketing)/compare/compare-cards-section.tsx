import Link from "next/link";
import { ArrowRight, Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPETITORS } from "@/lib/phase3/competitor-data";
import { FeatureCellValue } from "./[competitor]/compare-competitor-feature-cell";

export function CompareCardsSection() {
    return (
        <section className="py-20 px-4 bg-muted border-t border-border">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-3">Pick a comparison</h2>
                    <p className="text-muted-foreground text-center mb-12">
                        Each page has a full feature-by-feature breakdown, honest analysis, and pricing comparison.
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {COMPETITORS.map((comp) => (
                            <Link
                                key={comp.slug}
                                href={`/compare/${comp.slug}`}
                                className="group bg-card border border-border rounded-2xl p-7 hover:border-primary/50 hover:shadow-lg transition-all flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                        vs {comp.name}
                                    </h3>
                                    <ArrowRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all size-4" />
                                </div>
                                <div className="text-3xl font-black text-destructive mb-1">{comp.price}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                                <p className="text-xs text-muted-foreground mb-4">{comp.name} starting price</p>
                                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{comp.keyAngle}</p>
                                <div className="mt-4 pt-4 border-t border-border">
                                    <span className="text-xs font-semibold text-primary">Read full comparison →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
    );
}
