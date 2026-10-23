import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/automations/activity-calendar";
import { KIND_DOT } from "./calendar-kind-style";

function formatDayHeading(key: string): string {
    const [y, m, d] = key.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** The selected day's events in time order. */
export function CalendarDayPanel({ dayKey, events, timeZone }: { dayKey: string; events: CalendarEvent[]; timeZone: string }) {
    const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone });
    return (
        <aside aria-labelledby="calendar-day-title" className="rounded-lg border border-border">
            <header className="border-b border-border px-4 py-3">
                <h3 id="calendar-day-title" className="ui-card-title text-foreground">{formatDayHeading(dayKey)}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    {events.length === 0 ? "Nothing on this day" : `${events.length} thing${events.length === 1 ? "" : "s"} on this day`}
                </p>
            </header>
            {events.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">Pick another day, or start a campaign to fill your calendar.</p>
            ) : (
                <ul className="max-h-[28rem] divide-y divide-border overflow-y-auto">
                    {events.map((event) => (
                        <li key={event.id} className="flex items-start gap-2.5 px-4 py-2.5 text-sm">
                            <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", KIND_DOT[event.kind])} aria-hidden />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate font-medium text-foreground">{event.title}</span>
                                {event.detail && <span className="block text-xs text-muted-foreground">{event.detail}</span>}
                            </span>
                            <time dateTime={event.at} className="shrink-0 text-xs tabular-nums text-muted-foreground">{time.format(new Date(event.at))}</time>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
}
