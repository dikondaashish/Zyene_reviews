import Link from "next/link";
import { ArrowRight, CircleCheck, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAuditFixAction, type AuditItem } from "./google-seo-aeo-audit-utils";
import type { GoogleSeoAeoContentProps } from "./google-seo-aeo-content-props";
import type { AuditSummary } from "./audit-presentation";
import { getAuditGuidance, getScoreVerdict, type ScoreVerdict } from "./audit-guidance";

type AeoProfileHealthSummaryProps = {
    content: GoogleSeoAeoContentProps;
    summary: AuditSummary;
    priorityAudit: AuditItem | undefined;
};

const TONE_TEXT: Record<ScoreVerdict["tone"], string> = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
};

const TONE_BAR: Record<ScoreVerdict["tone"], string> = {
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
    muted: "bg-muted-foreground/40",
};

/** Verdict first, number second: an owner should know where they stand before reading a digit. */
export function AeoProfileHealthSummary({ content, summary, priorityAudit }: AeoProfileHealthSummaryProps) {
    const verdict = getScoreVerdict(content.score, content.measuredCount);
    const passing = summary.onTrack.length;

    return (
        <section
            aria-label="Google profile health"
            className="grid grid-cols-1 overflow-hidden rounded-xl border bg-card lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        >
            <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Google profile health</p>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", TONE_TEXT[verdict.tone])}>
                        {verdict.label}
                    </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-5xl font-semibold tabular-nums tracking-tight text-foreground">
                        {content.measuredCount === 0 ? "--" : content.score}
                    </span>
                    <span className="text-lg text-muted-foreground">out of 100</span>
                </div>
                <div
                    className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label="Google profile health score"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={content.measuredCount === 0 ? undefined : content.score}
                >
                    <div
                        className={cn("h-full rounded-full transition-[width] duration-200", TONE_BAR[verdict.tone])}
                        style={{ width: `${content.measuredCount === 0 ? 0 : content.score}%` }}
                    />
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground">{verdict.summary}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    {passing} of {content.measuredCount} checks passing
                    {summary.needsAttention.length > 0 ? (
                        <>
                            {" · "}
                            <span className="font-medium text-foreground">
                                {summary.needsAttention.length} to fix
                            </span>
                        </>
                    ) : null}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-4 text-sm text-muted-foreground">
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                        <MapPin className="size-3.5 shrink-0" aria-hidden />
                        <span className="truncate">{content.businessAddress}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Star className="size-3.5 shrink-0 fill-current text-warning" aria-hidden />
                        <span className="font-medium text-foreground">{content.googleAvgLive.toFixed(1)}</span> from{" "}
                        {content.googleCountLive.toLocaleString()} Google reviews
                    </span>
                </div>
            </div>

            <div className="flex flex-col justify-center gap-4 border-t border-border bg-muted/30 p-5 sm:p-6 lg:border-l lg:border-t-0">
                {priorityAudit ? (
                    <>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                Do this first
                            </p>
                            <p className="mt-2 font-medium text-foreground">{getAuditGuidance(priorityAudit).title}</p>
                            {getAuditGuidance(priorityAudit).why ? (
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {getAuditGuidance(priorityAudit).why}
                                </p>
                            ) : null}
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
                            <p className="font-medium text-foreground">Nothing urgent to fix</p>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                Every check we can measure is passing. Keep asking for reviews and posting updates to
                                stay ahead.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
