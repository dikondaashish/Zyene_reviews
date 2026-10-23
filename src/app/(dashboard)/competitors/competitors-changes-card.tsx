"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Bell, ChevronDown, Plus } from "lucide-react";
import { TimeAgo } from "@/components/ui/time-ago";
import { cn } from "@/lib/utils";
import type { ChangeFeedItem } from "@/lib/competitors/change-feed";

const ICON = { up: ArrowUpRight, down: ArrowDownRight, neutral: Plus } as const;
/** Newest changes shown while collapsed; the rest open with "Show all". */
export const COLLAPSED_CHANGE_COUNT = 5;

/** One feed of the moves worth knowing about; routine +1 review ticks are left out. */
export function CompetitorsChangesCard({ items, rangeLabel }: { items: ChangeFeedItem[]; rangeLabel: string }) {
    const [expanded, setExpanded] = useState(false);
    const listId = useId();
    const hiddenCount = Math.max(0, items.length - COLLAPSED_CHANGE_COUNT);
    const visible = expanded ? items : items.slice(0, COLLAPSED_CHANGE_COUNT);
    return (
        <section id="competitor-alerts" aria-labelledby="competitor-changes-title" className="scroll-mt-24 overflow-hidden rounded-xl border bg-card">
            <header className="flex flex-col gap-1 border-b border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                <div>
                    <h2 id="competitor-changes-title" className="ui-section-title text-foreground">What changed in the last {rangeLabel.toLowerCase()}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Rating moves and bigger jumps in reviews. Small day-to-day changes are left out.</p>
                </div>
                <Link href="/settings/competitor-alerts" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                    <Bell className="size-3.5" aria-hidden />Alert settings
                </Link>
            </header>
            {items.length === 0 ? (
                <p className="px-5 py-6 text-sm text-muted-foreground sm:px-6">Nothing notable changed in this period.</p>
            ) : (
                <>
                    <ul id={listId} className="divide-y divide-border">
                        {visible.map((item) => {
                            const Icon = ICON[item.tone];
                            return (
                                <li key={item.id} className="flex items-start gap-3 px-5 py-3 sm:px-6">
                                    <span className={cn(
                                        "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full",
                                        item.tone === "up" ? "bg-warning/15 text-warning-foreground" : item.tone === "down" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
                                    )} aria-hidden>
                                        <Icon className="size-3.5" />
                                    </span>
                                    <p className="min-w-0 flex-1 text-sm text-foreground">
                                        {item.isAlert ? <span className="mr-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary">Alert</span> : null}
                                        {item.text}
                                    </p>
                                    <span className="shrink-0 text-xs text-muted-foreground"><TimeAgo date={item.createdAt} /></span>
                                </li>
                            );
                        })}
                    </ul>
                    {hiddenCount > 0 ? (
                        <button
                            type="button"
                            aria-expanded={expanded}
                            aria-controls={listId}
                            onClick={() => setExpanded((v) => !v)}
                            className="flex w-full items-center justify-center gap-1.5 border-t border-border px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                        >
                            {expanded ? "Show fewer" : `Show all ${items.length} changes`}
                            <ChevronDown className={cn("size-4 transition-transform motion-reduce:transition-none", expanded && "rotate-180")} aria-hidden />
                        </button>
                    ) : null}
                </>
            )}
        </section>
    );
}
