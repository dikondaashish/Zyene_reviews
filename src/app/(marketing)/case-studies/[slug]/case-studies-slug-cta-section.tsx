import Link from "next/link";
import { ArrowRight, ArrowLeft, ChevronRight, Check, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CASE_STUDY_MAP, CASE_STUDY_SLUGS } from "@/lib/phase5/case-study-data";
import { SIGNUP_URL } from "@/config/env";

export function CaseStudiesSlugCtaSection({ study, slug, related }: { study: (typeof CASE_STUDY_MAP)[string]; slug: string; related: (typeof CASE_STUDY_MAP)[string][] }) {
    return (
        <section className="py-16 px-4 bg-muted border-t border-border">
                    <div className="container mx-auto max-w-3xl">
                        <h2 className="text-xl font-bold text-foreground mb-6">More case studies</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {related.map((r) => (
                                <Link
                                    key={r.slug}
                                    href={`/case-studies/${r.slug}`}
                                    className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
                                >
                                    <span className="text-2xl">{r.emoji}</span>
                                    <p className="font-semibold text-foreground mt-2">{r.company}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{r.excerpt}</p>
                                </Link>
                            ))}
                        </div>
                        <Link
                            href="/case-studies"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary mt-8 hover:brightness-90"
                        >
                            <ArrowLeft className="h-4 w-4" /> All case studies
                        </Link>
                    </div>
                </section>
    );
}
