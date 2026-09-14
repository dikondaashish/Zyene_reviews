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

/** A suppressed rate is never rendered as 0%, which would misrepresent missing evidence. */
export function AeoVisibilitySection({ content }: { content: AeoVisibilityContent }) {
    return (
        <section className="overflow-hidden rounded-xl border bg-card" aria-labelledby="ai-visibility-title">
            <header className="border-b border-border px-5 py-5 sm:px-6 sm:py-6">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 id="ai-visibility-title" className="text-lg font-semibold">
                        AI visibility
                    </h2>
                    <Badge variant="outline">{content.overallBasis === "measured" ? "Measured" : "Estimated"}</Badge>
                    <MetricProvenance title="Visibility across all engines" rows={content.overallProvenance} />
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    How often answer engines name this business in the last {content.windowDays} days. Refusals and
                    failed calls are not treated as evidence of absence.
                </p>
            </header>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_17rem]">
                <div className="p-5 sm:p-6">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Visibility across all engines
                    </p>
                    {content.overallRate === null ? (
                        <>
                            <p className="mt-2 text-2xl font-semibold text-foreground">Not enough data</p>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                                {content.overallSuppressedMessage}
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="mt-2 text-4xl font-semibold tabular-nums text-foreground">
                                {content.overallRate}
                            </p>
                            <div className="mt-3 h-2 max-w-xl overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: content.overallRate }}
                                />
                            </div>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                                {content.overallDetail}
                            </p>
                        </>
                    )}
                </div>
                <div className="border-t border-border bg-muted/30 p-5 lg:border-l lg:border-t-0 sm:p-6">
                    <p className="text-sm font-medium text-foreground">How to read this</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Each engine is reported independently, so you can see where evidence is strong and where more
                        observations are needed.
                    </p>
                </div>
            </div>

            <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2 xl:grid-cols-3">
                {content.tiles.map((tile) => (
                    <div key={tile.engineId} className="min-w-0 bg-card p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-medium text-foreground">{tile.label}</p>
                            <div className="flex shrink-0 items-center gap-1.5">
                                <Badge variant="outline" className="text-[10px]">
                                    {tile.basis === "measured" ? "Measured" : "Estimated"}
                                </Badge>
                                <MetricProvenance title={`${tile.label} visibility`} rows={tile.provenance} />
                            </div>
                        </div>
                        {tile.rate === null ? (
                            <>
                                <p className="mt-4 text-lg font-semibold text-foreground">Not enough data</p>
                                <p className="mt-2 text-sm leading-5 text-muted-foreground">{tile.suppressedMessage}</p>
                            </>
                        ) : (
                            <>
                                <p className="mt-4 text-2xl font-semibold tabular-nums text-foreground">{tile.rate}</p>
                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                    <div className="h-full rounded-full bg-primary" style={{ width: tile.rate }} />
                                </div>
                                <p className="mt-3 text-sm leading-5 text-muted-foreground">{tile.detail}</p>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
