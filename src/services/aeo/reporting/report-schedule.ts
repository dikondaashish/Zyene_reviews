export function reportPeriod(cadence: "weekly" | "monthly", now = new Date()) {
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
    const start = new Date(end);
    if (cadence === "weekly") start.setUTCDate(start.getUTCDate() - 6);
    else {
        start.setUTCMonth(start.getUTCMonth() - 1);
        start.setUTCDate(start.getUTCDate() + 1);
    }
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export function nextReportSend(cadence: "weekly" | "monthly", from = new Date()): string {
    const next = new Date(from);
    if (cadence === "weekly") next.setUTCDate(next.getUTCDate() + 7);
    else next.setUTCMonth(next.getUTCMonth() + 1);
    return next.toISOString();
}
