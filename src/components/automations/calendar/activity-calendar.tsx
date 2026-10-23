"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    CALENDAR_KINDS, buildMonthGrid, groupEventsByDay,
    type CalendarEvent, type CalendarEventKind, type CalendarMonth,
} from "@/lib/automations/activity-calendar";
import { CalendarDayPanel } from "./calendar-day-panel";
import { CalendarGrid } from "./calendar-grid";
import { KIND_DOT } from "./calendar-kind-style";

/** Everything Zyene did and will do this month, filterable by kind, with a day-by-day list. */
export function ActivityCalendar({
    month, events, timeZone, todayKey, capped,
}: {
    month: CalendarMonth; events: CalendarEvent[]; timeZone: string; todayKey: string; capped: boolean;
}) {
    const [hidden, setHidden] = useState<Set<CalendarEventKind>>(new Set());
    const weeks = useMemo(() => buildMonthGrid(month.year, month.month), [month.year, month.month]);
    const byDay = useMemo(() => groupEventsByDay(events.filter((e) => !hidden.has(e.kind)), timeZone), [events, hidden, timeZone]);
    const inThisMonth = todayKey.startsWith(month.param);
    const [selectedKey, setSelectedKey] = useState(() => (inThisMonth ? todayKey : `${month.param}-01`));

    const toggle = (kind: CalendarEventKind) => setHidden((prev) => {
        const next = new Set(prev);
        if (next.has(kind)) next.delete(kind); else next.add(kind);
        return next;
    });

    return (
        <section aria-labelledby="calendar-month-title" className="rounded-xl border bg-card p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="icon" className="size-8">
                        <Link href={`?month=${month.prevParam}`} aria-label="Previous month"><ChevronLeft className="size-4" /></Link>
                    </Button>
                    <h2 id="calendar-month-title" className="ui-section-title min-w-40 text-center">{month.label}</h2>
                    <Button asChild variant="outline" size="icon" className="size-8">
                        <Link href={`?month=${month.nextParam}`} aria-label="Next month"><ChevronRight className="size-4" /></Link>
                    </Button>
                    {!inThisMonth && <Button asChild variant="ghost" size="sm"><Link href="?">Today</Link></Button>}
                </div>
                <ul className="flex flex-wrap gap-1.5" aria-label="Show or hide event types">
                    {CALENDAR_KINDS.map(({ kind, label }) => (
                        <li key={kind}>
                            <button type="button" onClick={() => toggle(kind)} aria-pressed={!hidden.has(kind)}
                                className={cn(
                                    "inline-flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                                    hidden.has(kind) ? "border-border text-muted-foreground line-through" : "border-border bg-background text-foreground hover:bg-muted",
                                )}>
                                <span className={cn("size-2 rounded-full", KIND_DOT[kind], hidden.has(kind) && "opacity-40")} aria-hidden />{label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            {capped && (
                <p className="mt-3 text-xs text-muted-foreground">This month is very busy, so only the first 1,000 items of each type are shown.</p>
            )}
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <CalendarGrid weeks={weeks} byDay={byDay} todayKey={todayKey} selectedKey={selectedKey} onSelect={setSelectedKey} />
                <CalendarDayPanel dayKey={selectedKey} events={byDay[selectedKey] ?? []} timeZone={timeZone} />
            </div>
        </section>
    );
}
