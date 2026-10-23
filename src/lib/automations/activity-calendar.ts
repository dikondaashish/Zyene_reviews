/**
 * Month calendar of everything Zyene did, and will do, for one business: review requests,
 * reminders, replies posted, scheduled sends, and new reviews coming in.
 * Days are keyed in the business's time zone so an evening send lands on the right day.
 */
export type CalendarEventKind = "request" | "reminder" | "scheduled" | "auto-reply" | "reply" | "review";

export type CalendarEvent = { id: string; kind: CalendarEventKind; at: string; title: string; detail?: string };

export const CALENDAR_KINDS: Array<{ kind: CalendarEventKind; label: string }> = [
    { kind: "request", label: "Review request" },
    { kind: "reminder", label: "Reminder" },
    { kind: "scheduled", label: "Scheduled" },
    { kind: "auto-reply", label: "Auto reply" },
    { kind: "reply", label: "Reply" },
    { kind: "review", label: "New review" },
];

export type CalendarMonth = {
    year: number;
    /** 1–12 */
    month: number;
    label: string;
    param: string;
    prevParam: string;
    nextParam: string;
    /** Query window, padded a day each side so time-zone shifts never drop an edge event. */
    fromIso: string;
    toIso: string;
};

const pad = (n: number) => String(n).padStart(2, "0");
const toParam = (year: number, month: number) => `${year}-${pad(month)}`;

/** `?month=2026-10`, falling back to the current month in the business's time zone. */
export function resolveCalendarMonth(param: string | undefined, now: Date, timeZone: string): CalendarMonth {
    const match = /^(\d{4})-(\d{2})$/.exec(param ?? "");
    let year: number;
    let month: number;
    if (match && Number(match[2]) >= 1 && Number(match[2]) <= 12) {
        year = Number(match[1]);
        month = Number(match[2]);
    } else {
        const [y, m] = dayKey(now.toISOString(), timeZone).split("-").map(Number);
        year = y;
        month = m;
    }
    const prev = month === 1 ? [year - 1, 12] : [year, month - 1];
    const next = month === 12 ? [year + 1, 1] : [year, month + 1];
    const label = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" })
        .format(new Date(Date.UTC(year, month - 1, 1)));
    return {
        year, month, label,
        param: toParam(year, month), prevParam: toParam(prev[0], prev[1]), nextParam: toParam(next[0], next[1]),
        fromIso: new Date(Date.UTC(year, month - 1, 1) - 86_400_000).toISOString(),
        toIso: new Date(Date.UTC(year, month, 1) + 86_400_000).toISOString(),
    };
}

/** YYYY-MM-DD of an instant in a time zone. */
export function dayKey(iso: string, timeZone: string): string {
    return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}

export type CalendarDay = { key: string; day: number; inMonth: boolean };

/** Weeks of the month, Sunday first, padded with the neighbouring months' days. */
export function buildMonthGrid(year: number, month: number): CalendarDay[][] {
    const first = new Date(Date.UTC(year, month - 1, 1));
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const lead = first.getUTCDay();
    const weekCount = Math.ceil((lead + daysInMonth) / 7);
    const start = first.getTime() - lead * 86_400_000;
    return Array.from({ length: weekCount }, (_, w) => Array.from({ length: 7 }, (_, d) => {
        const date = new Date(start + (w * 7 + d) * 86_400_000);
        return {
            key: `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`,
            day: date.getUTCDate(),
            inMonth: date.getUTCMonth() === month - 1,
        };
    }));
}

/** Events per day key, each day's list oldest first. */
export function groupEventsByDay(events: CalendarEvent[], timeZone: string): Record<string, CalendarEvent[]> {
    const byDay: Record<string, CalendarEvent[]> = {};
    for (const event of [...events].sort((a, b) => a.at.localeCompare(b.at))) {
        (byDay[dayKey(event.at, timeZone)] ??= []).push(event);
    }
    return byDay;
}
