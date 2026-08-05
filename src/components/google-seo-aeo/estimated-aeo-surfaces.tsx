import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ESTIMATED_SURFACE_DISCLOSURE } from "@/lib/features/aeo-surfaces";
import type { GoogleSeoAeoContentProps } from "@/app/(dashboard)/google-seo-aeo/google-seo-aeo-content-props";

/**
 * AI-visibility and heatmap cards. Both render heuristic output, so every figure
 * carries an explicit method disclosure rather than a bare "beta" label.
 * Rendered only when `areEstimatedAeoSurfacesEnabled()` is true.
 */
export function EstimatedAeoSurfaces({ content }: { content: GoogleSeoAeoContentProps }) {
    return (
        <>
            <div className="border-sync-action/40 bg-sync-action/5 flex gap-3 rounded-lg border p-4">
                <AlertTriangle className="text-sync-action mt-0.5 size-4 shrink-0" />
                <p className="text-sm">{ESTIMATED_SURFACE_DISCLOSURE}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex flex-wrap items-center gap-2">
                        AI Visibility
                        <Badge variant="outline">Estimated</Badge>
                    </CardTitle>
                    <CardDescription>
                        Derived from your rating versus tracked competitors. No AI engine was queried.
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
                                            {m.found ? "Estimated: likely present" : "Estimated: likely absent"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No AI visibility estimates yet.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex flex-wrap items-center gap-2">
                        Heatmap audits
                        <Badge variant="outline">Estimated</Badge>
                    </CardTitle>
                    <CardDescription>
                        Labels are generated from your city name, not sampled at map coordinates.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
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
                                            Estimated rank #{cell.rank_position ?? "-"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p>No heatmap estimates yet.</p>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
