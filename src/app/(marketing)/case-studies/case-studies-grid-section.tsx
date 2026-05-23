import Link from "next/link";
import { ArrowRight, Building2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CASE_STUDIES } from "@/lib/phase5/case-study-data";
import { CustomerLogoBar } from "@/components/marketing/social-proof";
import { SIGNUP_URL } from "@/config/env";

export function CaseStudiesGridSection() {
    return (
        <section className="py-20 px-4 bg-background">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-8">
                        {CASE_STUDIES.map((study) => (
                            <article
                                key={study.slug}
                                className="bg-card border border-border rounded-2xl p-8 flex flex-col hover:border-primary/30 transition-colors"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <span className="text-4xl" aria-hidden>{study.emoji}</span>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {study.industry} · {study.location}
                                        </p>
                                        <h2 className="text-xl font-bold text-foreground mt-1">{study.company}</h2>
                                        <p className="text-xs text-muted-foreground mt-0.5">{study.size}</p>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-3 leading-snug">
                                    {study.headline}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6 flex-1 leading-relaxed">
                                    {study.excerpt}
                                </p>
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {study.metrics.slice(0, 2).map((m) => (
                                        <div key={m.label} className="bg-muted rounded-lg p-3 border border-border">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                                {m.label}
                                            </p>
                                            <p className="text-sm font-bold text-foreground">
                                                {m.before} → {m.after}
                                            </p>
                                            <p className="text-xs text-primary font-semibold mt-0.5">{m.change}</p>
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    href={`/case-studies/${study.slug}`}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:brightness-90"
                                >
                                    Read full case study <ArrowRight className="h-4 w-4" />
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
    );
}
