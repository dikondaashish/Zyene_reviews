import { MarketingGeoSummary } from "@/components/marketing/marketing-geo-summary";
import Link from "next/link";
import { ArrowRight, ArrowLeft, ChevronRight, Check, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CASE_STUDY_COMPOSITE_DISCLAIMER, CASE_STUDY_MAP, CASE_STUDY_SLUGS } from "@/lib/social-proof/case-study-data";
import { SIGNUP_URL } from "@/config/env";

export function CaseStudiesSlugHeaderSection({ study, slug, related }: { study: (typeof CASE_STUDY_MAP)[string]; slug: string; related: (typeof CASE_STUDY_MAP)[string][] }) {
    return (
        <header className="pt-20 pb-12 px-4 bg-background border-b border-border">
                <div className="container mx-auto max-w-3xl">
                    <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                        <Link href="/case-studies" className="hover:text-primary transition-colors">Case Studies</Link>
                        <ChevronRight className="size-3.5" />
                        <span className="text-foreground font-medium truncate">{study.company}</span>
                    </nav>

                    <p
                        className="mb-5 rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground leading-relaxed"
                        role="note"
                    >
                        <span className="font-semibold text-foreground">Representative example — </span>
                        {CASE_STUDY_COMPOSITE_DISCLAIMER}
                    </p>

                    <div className="flex items-center gap-3 mb-5">
                        <span className="text-4xl" aria-hidden>{study.emoji}</span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-primary">
                                {study.industry} · illustrative scenario
                            </p>
                            <p className="text-sm text-muted-foreground">{study.size}</p>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-5 leading-[1.1]">
                        {study.headline}
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-5">{study.excerpt}</p>
                    <MarketingGeoSummary label="Illustrative results in brief">
                        {study.resultsSummary}
                    </MarketingGeoSummary>
                    <p className="mt-4 text-xs text-muted-foreground">{study.timeline}</p>
                </div>
            </header>
    );
}
