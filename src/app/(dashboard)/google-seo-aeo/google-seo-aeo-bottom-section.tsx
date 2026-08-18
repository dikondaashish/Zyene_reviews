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
            <div id="description-optimizer">
                <DescriptionOptimizerCard
                    businessId={content.businessId}
                    currentDescription={content.listingDescription}
                    topKeywords={content.topKeywordList}
                />
            </div>

            {/* F6.6 — the same optimizer idea extended past the description. */}
            <div id="gbp-content-optimizer">
                <GbpContentOptimizerCard
                    businessId={content.businessId}
                    topKeywords={content.topKeywordList}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Competitors</CardTitle>
                    <CardDescription>Public Google profile benchmark snapshot.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {content.competitors.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No tracked competitors yet.</p>
                    ) : (
                        content.competitors.map((c, i) => (
                            <div
                                key={c.id}
                                className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                            >
                                <div className="min-w-0">
                                    <p className="font-medium">
                                        #{i + 1} {c.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {Number(c.average_rating || 0).toFixed(1)} (
                                        {(c.total_reviews || 0).toLocaleString()} reviews)
                                    </p>
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
