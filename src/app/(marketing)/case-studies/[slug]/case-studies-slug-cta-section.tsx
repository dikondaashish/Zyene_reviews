import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CASE_STUDY_MAP } from "@/lib/social-proof/case-study-data";

export function CaseStudiesSlugCtaSection({ related }: { related: (typeof CASE_STUDY_MAP)[string][] }) {
    return (
        <section className="border-t border-border bg-muted/35 py-16 sm:py-20">
            <div className="container mx-auto max-w-6xl px-4 sm:px-8">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">More case studies</h2>
                    <Link href="/case-studies" className="hidden items-center gap-2 text-sm font-semibold text-primary hover:underline sm:inline-flex">
                        All case studies <ArrowLeft className="size-4" aria-hidden="true" />
                    </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {related.map((r) => (
                        <Link key={r.slug} href={`/case-studies/${r.slug}`} className="group border-t border-border py-5 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{r.industry}</p>
                                    <p className="mt-2 text-lg font-semibold text-foreground">{r.company}</p>
                                    <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">{r.excerpt}</p>
                                </div>
                                <span className="text-xl transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                            </div>
                        </Link>
                    ))}
                </div>
                <Link href="/case-studies" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline sm:hidden">
                    <ArrowLeft className="size-4" aria-hidden="true" /> All case studies
                </Link>
            </div>
        </section>
    );
}
