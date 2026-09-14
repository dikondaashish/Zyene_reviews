import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuditFixAction, type AuditItem } from "./google-seo-aeo-audit-utils";
import type { GoogleSeoAeoContentProps } from "./google-seo-aeo-content-props";
import type { AuditSummary } from "./audit-presentation";

type AeoProfileHealthSummaryProps = {
    content: GoogleSeoAeoContentProps;
    summary: AuditSummary;
    priorityAudit: AuditItem | undefined;
};

export function AeoProfileHealthSummary({ content, summary, priorityAudit }: AeoProfileHealthSummaryProps) {
    return (
        <section aria-label="Profile health summary" className="overflow-hidden rounded-xl border bg-card">
            <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end">
                <div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span className="font-semibold text-foreground">Profile health</span>
                        <span className="text-muted-foreground">{summary.onTrack.length} on track</span>
                        <span className="text-muted-foreground">{summary.needsAttention.length} to improve</span>
                    </div>
                    <div
                        className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-label="Optimization score"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={content.score}
                    >
                        <div
                            className="h-full rounded-full bg-primary transition-[width] duration-200"
                            style={{ width: `${content.score}%` }}
                        />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3.5" />
                            {content.businessAddress}
                        </span>
                        <span>
                            {content.googleAvgLive.toFixed(1)}/5 from {content.googleCountLive.toLocaleString()} reviews
                        </span>
                        <span>
                            Scored on {content.measuredCount} of {content.audits.length} checks
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/70 px-4 py-3 lg:block lg:bg-transparent lg:px-0 lg:py-0">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Optimization score
                        </p>
                        <p className="mt-1 text-4xl font-semibold tabular-nums text-foreground">{content.score}%</p>
                    </div>
                    {priorityAudit ? (
                        <Button asChild size="sm" className="shrink-0">
                            <Link href={getAuditFixAction(priorityAudit.id).href}>Fix priority</Link>
                        </Button>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                            <Sparkles className="size-4" />
                            Looking good
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
}
