import { MarketingGeoSummary } from "@/components/marketing/marketing-geo-summary";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ChevronRight, MapPin } from "lucide-react";
import { CASE_STUDY_COMPOSITE_DISCLAIMER, CASE_STUDY_MAP } from "@/lib/social-proof/case-study-data";

export function CaseStudiesSlugHeaderSection({ study }: { study: (typeof CASE_STUDY_MAP)[string] }) {
    const resultSummary = study.resultsSummary.replace(/^Results in brief:\s*/i, "");

    return (
        <header className="border-b border-border bg-muted/25">
            <div className="container mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-8 lg:pb-20 lg:pt-12">
                <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
                    <Link href="/case-studies" className="transition-colors hover:text-foreground">Case studies</Link>
                    <ChevronRight className="size-4" aria-hidden="true" />
                    <span className="truncate text-foreground">{study.company}</span>
                </nav>

                <div className="mb-10 max-w-3xl border-y border-border py-4 text-sm leading-relaxed text-muted-foreground" role="note">
                    <span className="font-semibold text-foreground">Representative example: </span>
                    {CASE_STUDY_COMPOSITE_DISCLAIMER.replace(" - ", ": ")}
                </div>

                <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
                    <div>
                        <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                            <span className="font-bold uppercase tracking-[0.16em] text-primary">{study.industry}</span>
                            <span className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="size-4" aria-hidden="true" />{study.location}</span>
                            <span className="text-muted-foreground">{study.size}</span>
                        </div>
                        <h1 className="max-w-3xl text-balance text-4xl font-bold leading-[1.04] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">
                            {study.headline}
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">{study.excerpt}</p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href="#results" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground transition-transform hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                See the workflow <ArrowDown className="size-4" aria-hidden="true" />
                            </Link>
                            <Link href="/case-studies" className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-3 font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                All case studies <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>

                    <figure className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <Image
                            src="/images/industries/window-installation.webp"
                            alt="Stock photograph of a tradesperson fitting a window frame with a drill"
                            width={1600}
                            height={1068}
                            priority
                            className="aspect-[4/3] w-full object-cover"
                        />
                        <figcaption className="absolute bottom-3 left-3 rounded-full bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
                            Illustrative home-services scenario
                        </figcaption>
                    </figure>
                </div>

                <div className="mt-12 grid gap-6 border-t border-border pt-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Illustrative summary</p>
                        <p className="mt-2 text-sm text-muted-foreground">{study.timeline}</p>
                    </div>
                    <MarketingGeoSummary label="Illustrative summary">{resultSummary}</MarketingGeoSummary>
                </div>
            </div>
        </header>
    );
}
