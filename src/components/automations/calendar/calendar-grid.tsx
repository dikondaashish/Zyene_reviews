"use client";

import { cn } from "@/lib/utils";
import { CALENDAR_KINDS, type CalendarDay, type CalendarEvent } from "@/lib/automations/activity-calendar";
import { KIND_DOT, KIND_PLURAL } from "./calendar-kind-style";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_CHIPS = 3;

function DayChips({ events }: { events: CalendarEvent[] }) {
    const counts = CALENDAR_KINDS.map(({ kind }) => ({ kind, n: events.filter((e) => e.kind === kind).length })).filter((c) => c.n > 0);
    const shown = counts.slice(0, MAX_CHIPS);
    return (
        <span className="mt-1 flex flex-col gap-0.5">
            {shown.map(({ kind, n }) => (
                <span key={kind} className="flex items-center gap-1 truncate text-[11px] leading-4 text-muted-foreground">
                    <span className={cn("size-1.5 shrink-0 rounded-full", KIND_DOT[kind])} aria-hidden />
                    <span className="truncate">{n} {KIND_PLURAL[kind][n === 1 ? 0 : 1]}</span>
                </span>
            ))}
            {counts.length > MAX_CHIPS && <span className="text-[11px] leading-4 text-muted-foreground">+{counts.length - MAX_CHIPS} more</span>}
        </span>
    );
}

/** Month grid; each day is a button that opens its list in the panel beside it. */
export function CalendarGrid({
    weeks, byDay, todayKey, selectedKey, onSelect,
}: {
    weeks: CalendarDay[][]; byDay: Record<string, CalendarEvent[]>; todayKey: string; selectedKey: string; onSelect: (key: string) => void;
}) {
    return (
        <div className="overflow-hidden rounded-lg border border-border">
            <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-xs font-medium text-muted-foreground">
                {WEEKDAYS.map((d) => <span key={d} className="py-2">{d}</span>)}
            </div>
            <div className="grid grid-cols-7">
                {weeks.flat().map((day) => {
                    const events = byDay[day.key] ?? [];
                    const selected = day.key === selectedKey;
                    return (
                        <button
                            key={day.key}
                            type="button"
                            onClick={() => onSelect(day.key)}
                            aria-pressed={selected}
                            aria-label={`${day.key}: ${events.length} event${events.length === 1 ? "" : "s"}`}
                            className={cn(
                                "min-h-20 border-b border-r border-border p-1.5 text-left align-top transition-colors last:border-r-0 hover:bg-muted/40 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-ring sm:min-h-24 sm:p-2 [&:nth-child(7n)]:border-r-0",
                                !day.inMonth && "bg-muted/20 text-muted-foreground/60",
                                selected && "bg-primary/5 ring-1 ring-inset ring-primary",
                            )}
                        >
                            <span className={cn(
                                "inline-grid size-6 place-items-center rounded-full text-xs tabular-nums",
                                day.key === todayKey ? "bg-primary font-semibold text-primary-foreground" : day.inMonth ? "text-foreground" : "",
                            )}>
                                {day.day}
                            </span>
                            {events.length > 0 && <span className="hidden sm:block"><DayChips events={events} /></span>}
                            {events.length > 0 && (
                                <span className="mt-1 flex flex-wrap gap-0.5 sm:hidden" aria-hidden>
                                    {[...new Set(events.map((e) => e.kind))].map((k) => <span key={k} className={cn("size-1.5 rounded-full", KIND_DOT[k])} />)}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
