"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown, ListChecks, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { summarizeReplyRules } from "@/lib/reviews/reply-rules-summary";
import type { ReplyRulesSummary } from "@/services/reviews/reply-rules-summary-load";

const ACTION_LABEL: Record<string, string> = {
    approval: "Draft a reply for your approval",
    auto: "Post an AI reply automatically",
    template: "Post your saved reply automatically",
    ignore: "Don't reply",
};

/** Shown on the Reviews page instead of the single switch once per-star reply rules are on. */
export function ReplyRulesSummaryPanel({ summary }: { summary: ReplyRulesSummary }) {
    const lines = summarizeReplyRules(summary.rules);
    const pending = summary.pendingApprovals;
    return (
        <details className="group rounded-xl border border-border bg-card">
            <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 rounded-xl px-4 py-3 focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted"><ListChecks className="size-4 text-muted-foreground" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        Reply rules
                        <span className="rounded-md bg-success/10 px-1.5 py-0.5 text-xs text-success">On</span>
                        {pending > 0 && (
                            <span className="rounded-md bg-warning/15 px-1.5 py-0.5 text-xs text-foreground">{pending} waiting for approval</span>
                        )}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">Google · {lines.join(" · ")}</span>
                </span>
                <span className="hidden text-xs font-medium text-muted-foreground sm:inline">Details</span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
            </summary>
            <section aria-label="Reply rules by star rating" className="space-y-4 border-t border-border p-4 sm:p-5">
                <ul className="divide-y divide-border rounded-lg border border-border">
                    {[...summary.rules].sort((a, b) => b.rating - a.rating).map((rule) => (
                        <li key={rule.rating} className="flex flex-col gap-1 px-3 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
                            <span className="flex items-center gap-0.5" aria-label={`${rule.rating}-star reviews`}>
                                {Array.from({ length: 5 }, (_, i) => (
                                    <Star key={i} strokeWidth={0} aria-hidden
                                        className={cn("size-4 fill-current", i < rule.rating ? "text-warning" : "text-muted-foreground/25")} />
                                ))}
                            </span>
                            <span className={cn(rule.action === "ignore" ? "text-muted-foreground" : "text-foreground")}>
                                {ACTION_LABEL[rule.action] ?? ACTION_LABEL.approval}
                            </span>
                        </li>
                    ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                    {pending > 0 && (
                        <Button asChild size="sm">
                            <Link href="/reviews/approvals">Review {pending} draft{pending === 1 ? "" : "s"}<ArrowRight className="size-4" /></Link>
                        </Button>
                    )}
                    <Button asChild size="sm" variant="outline"><Link href="/settings/reply-rules">Change rules</Link></Button>
                </div>
                <p className="text-xs text-muted-foreground">Rules apply to new Google reviews. Older reviews still waiting can be answered from the list below.</p>
            </section>
        </details>
    );
}

/** Nudge from the single switch to per-star rules, so low ratings get a draft instead of silence. */
export function ReplyRulesCallout() {
    return (
        <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Want a different rule for each star rating?</span>{" "}
                For example, post 4–5★ replies automatically and have 1–3★ replies drafted for your approval.
            </p>
            <Button asChild size="sm" variant="outline" className="shrink-0">
                <Link href="/settings/reply-rules">Set reply rules<ArrowRight className="size-4" /></Link>
            </Button>
        </div>
    );
}
