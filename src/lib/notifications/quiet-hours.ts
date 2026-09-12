/** Quiet-hour boundaries follow the business timezone; the ending minute is active again. */
export function isInQuietHours(now: Date, start: string | null | undefined, end: string | null | undefined, timezone: string | null | undefined): boolean {
    if (!start || !end) return false;
    const minutes = (value: string) => { const [h, m] = value.split(":").map(Number); return h * 60 + m; };
    const startMinute = minutes(start);
    const endMinute = minutes(end);
    if (!Number.isFinite(startMinute) || !Number.isFinite(endMinute)) return false;
    let parts: Intl.DateTimeFormatPart[];
    try {
        parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone || "UTC", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
    } catch {
        parts = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
    }
    const current = Number(parts.find(p => p.type === "hour")?.value) * 60 + Number(parts.find(p => p.type === "minute")?.value);
    return startMinute < endMinute ? current >= startMinute && current < endMinute : current >= startMinute || current < endMinute;
}
