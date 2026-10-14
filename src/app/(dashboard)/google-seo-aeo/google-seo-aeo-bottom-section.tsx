import { ExternalLink, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DescriptionOptimizerCard } from "@/components/google-seo-aeo/description-optimizer-card";
import { GbpContentOptimizerCard } from "@/components/google-seo-aeo/gbp-content-optimizer-card";
import { EstimatedAeoSurfaces } from "@/components/google-seo-aeo/estimated-aeo-surfaces";
import { areEstimatedAeoSurfacesEnabled } from "@/lib/features/aeo-surfaces";
import type { GoogleSeoAeoContentProps } from "./google-seo-aeo-content-props";
import { SeoSection } from "./seo-section";

export function GoogleSeoAeoBottomSection({ content }: { content: GoogleSeoAeoContentProps }) {
    return (
        <>
            <section className="space-y-4" aria-labelledby="content-workspace-title">
                <div>
                    <h2 id="content-workspace-title" className="text-lg font-semibold tracking-tight">
                        Improve your Google profile
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                        Draft a better description and posts with AI. Nothing is published until you review it.
                    </p>
                </div>
                <div className="grid items-start gap-6 xl:grid-cols-2">
                    <div id="description-optimizer" className="scroll-mt-24">
                        <DescriptionOptimizerCard
                            businessId={content.businessId}
                            currentDescription={content.listingDescription}
                            topKeywords={content.topKeywordList}
                        />
                    </div>
                    <div id="gbp-content-optimizer" className="scroll-mt-24">
                        <GbpContentOptimizerCard businessId={content.businessId} topKeywords={content.topKeywordList} />
                    </div>
                </div>
            </section>

            <SeoSection
                id="competitor-snapshot-title"
                title="Nearby competitors"
                description="How the competitors you track look on Google."
            >
                {content.competitors.length === 0 ? (
                    <div className="flex flex-col items-start gap-3 px-5 py-6 sm:px-6">
                        <p className="text-sm text-muted-foreground">
                            You are not tracking any competitors yet. Add a few to compare ratings and AI mentions.
                        </p>
                        <Button asChild size="sm" variant="outline">
                            <Link href="/competitors">Add competitors</Link>
                        </Button>
                    </div>
                ) : (
                    <ul className="divide-y divide-border">
                        {content.competitors.map((c) => (
                            <li key={c.id} className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                                    <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Star className="size-3.5 fill-current text-warning" aria-hidden />
                                        {Number(c.average_rating || 0).toFixed(1)} ·{" "}
                                        {(c.total_reviews || 0).toLocaleString()} reviews
                                    </p>
                                </div>
                                {c.google_url ? (
                                    <Button asChild size="sm" variant="ghost" className="shrink-0">
                                        <a href={c.google_url} target="_blank" rel="noopener noreferrer">
                                            View on Google <ExternalLink className="size-3.5" />
                                        </a>
                                    </Button>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                )}
            </SeoSection>

            {areEstimatedAeoSurfacesEnabled() ? <EstimatedAeoSurfaces content={content} /> : null}
        </>
    );
}
