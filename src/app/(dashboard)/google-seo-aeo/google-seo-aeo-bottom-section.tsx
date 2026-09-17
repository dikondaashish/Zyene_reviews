import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DescriptionOptimizerCard } from "@/components/google-seo-aeo/description-optimizer-card";
import { GbpContentOptimizerCard } from "@/components/google-seo-aeo/gbp-content-optimizer-card";
import { EstimatedAeoSurfaces } from "@/components/google-seo-aeo/estimated-aeo-surfaces";
import { areEstimatedAeoSurfacesEnabled } from "@/lib/features/aeo-surfaces";
import type { GoogleSeoAeoContentProps } from "./google-seo-aeo-content-props";

export function GoogleSeoAeoBottomSection({ content }: { content: GoogleSeoAeoContentProps }) {
    return (
        <>
            <section className="space-y-5" aria-labelledby="content-workspace-title">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                        Turn insight into action
                    </p>
                    <h2 id="content-workspace-title" className="mt-2 text-xl font-semibold tracking-tight">
                        Google profile workspace
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        Create a stronger profile from the opportunities above. Review every draft before it reaches
                        Google.
                    </p>
                </div>
                <div className="grid items-start gap-6 xl:grid-cols-2">
                    <div id="description-optimizer">
                        <DescriptionOptimizerCard
                            businessId={content.businessId}
                            currentDescription={content.listingDescription}
                            topKeywords={content.topKeywordList}
                        />
                    </div>
                    <div id="gbp-content-optimizer">
                        <GbpContentOptimizerCard businessId={content.businessId} topKeywords={content.topKeywordList} />
                    </div>
                </div>
            </section>

            <Card className="overflow-hidden border">
                <CardHeader className="border-b bg-muted/25">
                    <CardTitle>Local competitor snapshot</CardTitle>
                    <CardDescription>Public Google profile benchmarks for your tracked competitors.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {content.competitors.length === 0 ? (
                        <p className="px-6 py-6 text-sm text-muted-foreground">No tracked competitors yet.</p>
                    ) : (
                        content.competitors.map((c, i) => (
                            <div
                                key={c.id}
                                className="flex flex-col gap-3 border-b px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                        {i + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">{c.name}</p>
                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                            {Number(c.average_rating || 0).toFixed(1)} (
                                            {(c.total_reviews || 0).toLocaleString()} reviews)
                                        </p>
                                    </div>
                                </div>
                                {c.google_url ? (
                                    <Button asChild size="sm" variant="ghost">
                                        <a href={c.google_url} target="_blank" rel="noopener noreferrer">
                                            Open <ExternalLink className="ml-1 size-3.5" />
                                        </a>
                                    </Button>
                                ) : null}
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {areEstimatedAeoSurfacesEnabled() ? <EstimatedAeoSurfaces content={content} /> : null}
        </>
    );
}
