import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessesSummary as Summary } from "@/components/businesses/business-attention";

function Figure({ label, value, hint, emphasis }: { label: string; value: ReactNode; hint?: string; emphasis?: boolean }) {
    return (
        <div className="min-w-0 bg-card px-5 py-4 sm:px-6">
            <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
            <dd className={cn("mt-1 text-2xl font-semibold tabular-nums tracking-tight", emphasis ? "text-warning-foreground" : "text-foreground")}>
                {value}
            </dd>
            {hint ? <dd className="mt-0.5 text-xs text-muted-foreground">{hint}</dd> : null}
        </div>
    );
}

/** Portfolio view for owners with more than one location: one verdict, then four plain numbers. */
export function BusinessesSummary({ summary }: { summary: Summary }) {
    const allGood = summary.needingAttention === 0;
    const Icon = allGood ? CircleCheck : CircleAlert;

    return (
        <section aria-labelledby="businesses-summary-title" className="overflow-hidden rounded-xl border border-border/70 bg-card">
            <header className="flex items-start gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
                <Icon className={cn("mt-0.5 size-5 shrink-0", allGood ? "text-success" : "text-warning-foreground")} aria-hidden />
                <div className="min-w-0">
                    <h2 id="businesses-summary-title" className="ui-section-title text-foreground">
                        {allGood
                            ? `All ${summary.locations} locations are in good shape`
                            : `${summary.needingAttention} of your ${summary.locations} locations need${summary.needingAttention === 1 ? "s" : ""} attention`}
                    </h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        {allGood ? "Every location is connected to Google and has no reviews waiting." : "Look for the highlighted line on each location below."}
                    </p>
                </div>
            </header>
            <dl className="grid grid-cols-2 gap-px bg-border/60 lg:grid-cols-4">
                <Figure
                    label="Average rating"
                    value={summary.averageRating === null ? "None yet" : (
                        <span className="inline-flex items-center gap-1.5">
                            <Star className="size-5 fill-current text-warning" strokeWidth={0} aria-hidden />
                            {summary.averageRating.toFixed(1)}
                        </span>
                    )}
                    hint="Across all locations"
                />
                <Figure label="Total reviews" value={summary.totalReviews.toLocaleString("en-US")} hint="All platforms" />
                <Figure
                    label="Waiting for a reply"
                    value={summary.waitingForReply.toLocaleString("en-US")}
                    hint={summary.waitingForReply === 0 ? "You are all caught up" : "Replying quickly builds trust"}
                    emphasis={summary.waitingForReply > 0}
                />
                <Figure
                    label="Connected to Google"
                    value={`${summary.googleConnected} of ${summary.locations}`}
                    hint={summary.googleConnected === summary.locations ? "Reviews sync automatically" : "Connect the rest to sync reviews"}
                    emphasis={summary.googleConnected < summary.locations}
                />
            </dl>
        </section>
    );
}
