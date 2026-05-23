import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DescriptionOptimizerCard } from "@/components/google-seo-aeo/description-optimizer-card";
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
                                            Open <ExternalLink className="ml-1 h-3.5 w-3.5" />
                                        </a>
                                    </Button>
                                ) : null}
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>AI Visibility</CardTitle>
                    <CardDescription>
                        Beta estimate from internal scoring heuristics (real provider checks coming next).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {content.latestAiRun ? (
                        <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">
                                Latest run:{" "}
                                <span className="font-medium text-foreground">{content.latestAiRun.query}</span> ·{" "}
                                {content.latestAiRun.status}
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {content.aiResults.map((m) => (
                                    <div key={m.model} className="rounded-lg border p-3">
                                        <p className="text-sm font-medium">{m.model}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {m.found
                                                ? `Result: ${m.position ? `${m.position}${m.position === 1 ? "st" : m.position === 2 ? "nd" : m.position === 3 ? "rd" : "th"} position` : "Found"}`
                                                : "Result: Not found"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No AI visibility audits yet. Run one above.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Heatmap audits</CardTitle>
                    <CardDescription>
                        Beta estimated geo-grid (real rank-tracking integration coming next).
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    {content.latestHeatmapRun ? (
                        <>
                            <p>
                                Keyword:{" "}
                                <span className="font-medium text-foreground">{content.latestHeatmapRun.keyword}</span>{" "}
                                · {content.latestHeatmapRun.status}
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {content.heatmapCells.slice(0, 9).map((cell) => (
                                    <div key={cell.cell_label} className="rounded-lg border p-3">
                                        <p className="text-sm font-medium">{cell.cell_label}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Rank #{cell.rank_position ?? "—"} · Visibility {cell.visibility_score}%
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p>No heatmap audits yet. Run one above.</p>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
