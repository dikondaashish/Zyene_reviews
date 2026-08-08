import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricProvenance } from "@/components/google-seo-aeo/metric-provenance";
import type { VisibilityTile } from "./aeo-visibility-view-model";

export type AeoVisibilityContent = {
    tiles: VisibilityTile[];
    overallRate: string | null;
    overallSuppressedMessage: string | null;
    overallDetail: string;
    /** Derived, never assumed. A hardcoded "Measured" is a claim, not a label. */
    overallBasis: "measured" | "estimated";
    overallProvenance: { label: string; value: string }[];
    windowDays: number;
};

/**
 * QA #35–#37. Every tile carries its own provenance and its own badge, and a
 * rate the sample cannot support is not rendered as a number at all.
 *
 * There is deliberately no "0%" fallback anywhere below. A suppressed rate and a
 * measured zero look identical once both are printed as 0%, and this product
 * exists because that conflation shipped once already.
 */
export function AeoVisibilitySection({ content }: { content: AeoVisibilityContent }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                    Answer engine visibility
                    <Badge variant="outline">
                        {content.overallBasis === "measured" ? "Measured" : "Estimated"}
                    </Badge>
                    <MetricProvenance title="Visibility across all engines" rows={content.overallProvenance} />
                </CardTitle>
                <CardDescription>
                    How often answer engines name this business, over the last {content.windowDays} days.
                    Only answers count — a refusal or a failed call is not evidence of absence.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="rounded-lg border p-4">
                    {content.overallRate === null ? (
                        <>
                            <p className="text-2xl font-bold text-muted-foreground">Not enough data</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {content.overallSuppressedMessage}
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-3xl font-bold">{content.overallRate}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{content.overallDetail}</p>
                        </>
                    )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {content.tiles.map((tile) => (
                        <div key={tile.engineId} className="min-w-0 rounded-lg border p-3">
                            <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-medium">{tile.label}</p>
                                <div className="flex shrink-0 items-center gap-1.5">
                                    <Badge variant="outline" className="text-[10px]">
                                        {tile.basis === "measured" ? "Measured" : "Estimated"}
                                    </Badge>
                                    <MetricProvenance title={`${tile.label} visibility`} rows={tile.provenance} />
                                </div>
                            </div>

                            {tile.rate === null ? (
                                <>
                                    <p className="mt-2 text-lg font-semibold text-muted-foreground">
                                        Not enough data
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {tile.suppressedMessage}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="mt-2 text-2xl font-bold">{tile.rate}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{tile.detail}</p>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
