import Link from "next/link";
import { ArrowRight, CircleCheck, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuditFixAction, type AuditItem } from "./google-seo-aeo-audit-utils";
import type { GoogleSeoAeoContentProps } from "./google-seo-aeo-content-props";
import type { AuditSummary } from "./audit-presentation";

type AeoProfileHealthSummaryProps = {
    content: GoogleSeoAeoContentProps;
    summary: AuditSummary;
    priorityAudit: AuditItem | undefined;
};

/** Score on the left, the single most useful next step on the right. */
export function AeoProfileHealthSummary({ content, summary, priorityAudit }: AeoProfileHealthSummaryProps) {
    return (
        <section
            aria-label="Profile health summary"
            className="grid overflow-hidden rounded-xl border bg-card lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        >
            <div className="p-5 sm:p-6">
                <p className="text-sm font-medium text-muted-foreground">Google profile score</p>
                <div className="mt-2 flex items-baseline gap-3">
                    <span className="text-5xl font-semibold tabular-nums tracking-tight text-foreground">
                        {content.score}
                    </span>
                    <span className="text-lg text-muted-foreground">/ 100</span>
                </div>
                <div
                    className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label="Google profile score"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={content.score}
                >
                    <div
                        className="h-full rounded-full bg-primary transition-[width] duration-200"
                        style={{ width: `${content.score}%` }}
                    />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{summary.needsAttention.length} to fix</span>
                    {" · "}
                    {summary.onTrack.length} on track · based on {content.measuredCount} of {content.audits.length}{" "}
                    checks
                </p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                        <MapPin className="size-3.5 shrink-0" aria-hidden />
                        <span className="truncate">{content.businessAddress}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Star className="size-3.5 shrink-0 fill-current text-warning" aria-hidden />
                        {content.googleAvgLive.toFixed(1)} · {content.googleCountLive.toLocaleString()} reviews
                    </span>
                </div>
            </div>

            <div className="flex flex-col justify-center gap-4 border-t border-border bg-muted/30 p-5 sm:p-6 lg:border-l lg:border-t-0">
                {priorityAudit ? (
                    <>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                Best next step
                            </p>
                            <p className="mt-2 font-medium text-foreground">{priorityAudit.label}</p>
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                {priorityAudit.detail}
                            </p>
                        </div>
                        <Button asChild className="self-start">
                            <Link href={getAuditFixAction(priorityAudit.id).href}>
                                {getAuditFixAction(priorityAudit.id).label}
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </>
                ) : (
                    <div className="flex items-start gap-3">
                        <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
                        <div>
                            <p className="font-medium text-foreground">Your profile is in great shape</p>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                Every measured check is on track. Keep collecting reviews and posting updates.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
