import { Badge } from "@/components/ui/badge";
import { MetricProvenance } from "@/components/google-seo-aeo/metric-provenance";
import type { VisibilityTile } from "./aeo-visibility-view-model";
import { SeoSection } from "./seo-section";

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

/** Plain reading of a pre-formatted rate, so "23%" arrives with a meaning attached. */
function describeRate(rate: string): string {
    const value = Number.parseFloat(rate);
    if (value >= 50) return "Named in most answers";
    if (value >= 20) return "Named in some answers";
    if (value > 0) return "Rarely named";
    return "Not named yet";
}

/** A suppressed rate is never rendered as 0%, which would misrepresent missing evidence. */
export function AeoVisibilitySection({ content }: { content: AeoVisibilityContent }) {
    return (
        <SeoSection
            id="ai-visibility-title"
            title="Do AI assistants recommend you?"
            meta={
                <>
                    <Badge variant="outline">{content.overallBasis === "measured" ? "Real answers" : "Estimated"}</Badge>
                    <MetricProvenance title="Visibility across all engines" rows={content.overallProvenance} />
                </>
            }
            description={`When customers ask ChatGPT, Gemini and similar tools for a recommendation, how often your business is named. Last ${content.windowDays} days.`}
        >
            <div className="p-5 sm:p-6">
                <p className="text-sm font-medium text-muted-foreground">Across all AI assistants</p>
                {content.overallRate === null ? (
                    <>
                        <p className="mt-1 text-2xl font-semibold text-foreground">Not enough data yet</p>
                        <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                            {content.overallSuppressedMessage}
                        </p>
                    </>
                ) : (
                    <>
                        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <p className="text-4xl font-semibold tabular-nums text-foreground">{content.overallRate}</p>
                            <p className="text-sm font-medium text-foreground">{describeRate(content.overallRate)}</p>
                        </div>
                        <div className="mt-3 h-2 max-w-xl overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: content.overallRate }} />
                        </div>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{content.overallDetail}</p>
                    </>
                )}
            </div>

            <ul className="-mb-px -mr-px grid grid-cols-1 border-t border-border sm:grid-cols-2 xl:grid-cols-3">
                {content.tiles.map((tile) => (
                    <li key={tile.engineId} className="min-w-0 border-b border-r border-border p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium text-foreground">{tile.label}</p>
                            <div className="flex shrink-0 items-center gap-1.5">
                                {tile.basis === "estimated" ? (
                                    <Badge variant="outline" className="text-[10px]">
                                        Estimated
                                    </Badge>
                                ) : null}
                                <MetricProvenance title={`${tile.label} visibility`} rows={tile.provenance} />
                            </div>
                        </div>
                        {tile.rate === null ? (
                            <>
                                <p className="mt-3 text-base font-semibold text-muted-foreground">Not enough data</p>
                                <p className="mt-1 text-sm leading-5 text-muted-foreground">{tile.suppressedMessage}</p>
                            </>
                        ) : (
                            <>
                                <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">{tile.rate}</p>
                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                    <div className="h-full rounded-full bg-primary" style={{ width: tile.rate }} />
                                </div>
                                <p className="mt-2 text-sm leading-5 text-muted-foreground">{tile.detail}</p>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </SeoSection>
    );
}
