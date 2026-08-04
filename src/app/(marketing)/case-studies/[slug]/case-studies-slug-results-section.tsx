import Link from "next/link";
import { ArrowRight, ArrowLeft, ChevronRight, Check, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CASE_STUDY_MAP, CASE_STUDY_SLUGS } from "@/lib/social-proof/case-study-data";
import { SIGNUP_URL } from "@/config/env";

export function CaseStudiesSlugResultsSection({ study, slug, related }: { study: (typeof CASE_STUDY_MAP)[string]; slug: string; related: (typeof CASE_STUDY_MAP)[string][] }) {
    return (
        <section>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Illustrative results</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Scenario metrics below are composite examples for planning—not audited results from a verified customer engagement.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {study.metrics.map((m) => (
                                <div key={m.label} className="bg-card border border-border rounded-xl p-6">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                        {m.label}
                                    </p>
                                    <div className="flex items-baseline gap-3 mb-1">
                                        <span className="text-lg text-muted-foreground line-through">{m.before}</span>
                                        <ArrowRight className="text-primary shrink-0 size-4" />
                                        <span className="text-2xl font-bold text-foreground">{m.after}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-primary">{m.change}</p>
                                </div>
                            ))}
                        </div>
                    </section>
    );
}
