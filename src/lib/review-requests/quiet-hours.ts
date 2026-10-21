/**
 * Customer-facing quiet hours for review requests, evaluated in the business's own
 * timezone (IANA name, DST-aware via Intl). Pure: no I/O, safe to unit test.
 */

export type QuietHoursSettings = {
    enabled: boolean;
    /** "HH:MM" or "HH:MM:SS" local wall-clock time. */
    start: string;
    end: string;
    timezone: string | null | undefined;
};

type WallClock = { year: number; month: number; day: number; hour: number; minute: number };

function parseClock(value: string): number | null {
    const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return null;
    return hours * 60 + minutes;
}

export function resolveTimezone(timezone: string | null | undefined): string {
    if (!timezone) return "UTC";
    try {
        new Intl.DateTimeFormat("en-US", { timeZone: timezone });
        return timezone;
    } catch {
        return "UTC";
    }
}

function wallClock(date: Date, timeZone: string): WallClock {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    }).formatToParts(date);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
    return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute") };
}

function offsetMs(date: Date, timeZone: string): number {
    const w = wallClock(date, timeZone);
    const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute);
    return asUtc - Math.floor(date.getTime() / 60_000) * 60_000;
}

/** UTC instant for a local wall-clock time; times inside a DST gap resolve just after it. */
export function zonedTimeToUtc(local: WallClock, timeZone: string): Date {
    const naive = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute);
    const first = naive - offsetMs(new Date(naive), timeZone);
    const second = naive - offsetMs(new Date(first), timeZone);
    const matches = (instant: number) => {
        const w = wallClock(new Date(instant), timeZone);
        return w.day === local.day && w.hour === local.hour && w.minute === local.minute;
    };
    if (matches(second)) return new Date(second);
    if (matches(first)) return new Date(first);
    return new Date(Math.max(first, second));
}

function isQuietMinute(minute: number, start: number, end: number): boolean {
    return start > end ? minute >= start || minute < end : minute >= start && minute < end;
}

/**
 * Returns null when a message may be sent at `now`, otherwise the first allowed
 * instant (the local quiet-hours end) after `now`.
 */
export function nextAllowedSendTime(now: Date, settings: QuietHoursSettings): Date | null {
    if (!settings.enabled) return null;
    const start = parseClock(settings.start);
    const end = parseClock(settings.end);
    if (start === null || end === null || start === end) return null;

    const timeZone = resolveTimezone(settings.timezone);
    const local = wallClock(now, timeZone);
    const minute = local.hour * 60 + local.minute;
    if (!isQuietMinute(minute, start, end)) return null;

    // Overnight window and we're before midnight: quiet hours end tomorrow.
    const endsTomorrow = start > end && minute >= start;
    const day = new Date(Date.UTC(local.year, local.month - 1, local.day + (endsTomorrow ? 1 : 0)));
    const allowed = zonedTimeToUtc({
        year: day.getUTCFullYear(), month: day.getUTCMonth() + 1, day: day.getUTCDate(),
        hour: Math.floor(end / 60), minute: end % 60,
    }, timeZone);
    return allowed.getTime() > now.getTime() ? allowed : new Date(now.getTime() + 60_000);
}

export function quietHoursFromBusiness(business: {
    review_request_quiet_hours_enabled?: boolean | null;
    review_request_quiet_start?: string | null;
    review_request_quiet_end?: string | null;
    timezone?: string | null;
}): QuietHoursSettings {
    return {
        enabled: Boolean(business.review_request_quiet_hours_enabled),
        start: business.review_request_quiet_start || "21:00",
        end: business.review_request_quiet_end || "08:00",
        timezone: business.timezone,
    };
}

/** UTC instant of local midnight (start of "today") in the given timezone. */
export function startOfLocalDay(now: Date, timezone: string | null | undefined): Date {
    const timeZone = resolveTimezone(timezone);
    const local = wallClock(now, timeZone);
    return zonedTimeToUtc({ year: local.year, month: local.month, day: local.day, hour: 0, minute: 0 }, timeZone);
}
