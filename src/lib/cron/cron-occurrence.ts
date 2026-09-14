export type CronCadence =
  | "five-minute"
  | "fifteen-minute"
  | "hourly"
  | "twelve-hour"
  | "daily"
  | "weekly"
  | "monthly";

/**
 * Gives every scheduled invocation a deterministic UTC identity. UTC matches
 * Vercel Cron semantics and avoids server-region and daylight-saving drift.
 */
export function cronOccurrenceKey(
  cadence: CronCadence,
  now = new Date(),
): string {
  if (Number.isNaN(now.getTime())) {
    throw new Error("A cron occurrence requires a valid date");
  }

  const day = now.toISOString().slice(0, 10);
  const hour = now.getUTCHours();

  switch (cadence) {
    case "five-minute":
      return `${day}T${String(hour).padStart(2, "0")}:${String(Math.floor(now.getUTCMinutes() / 5) * 5).padStart(2, "0")}Z`;
    case "fifteen-minute":
      return `${day}T${String(hour).padStart(2, "0")}:${String(Math.floor(now.getUTCMinutes() / 15) * 15).padStart(2, "0")}Z`;
    case "hourly":
      return `${day}T${String(hour).padStart(2, "0")}Z`;
    case "twelve-hour":
      return `${day}T${String(Math.floor(hour / 12) * 12).padStart(2, "0")}Z`;
    case "daily":
      return day;
    case "weekly":
      return isoWeekKey(now);
    case "monthly":
      return day.slice(0, 7);
  }
}

function isoWeekKey(date: Date): string {
  const utc = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const weekday = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - weekday);

  const weekYear = utc.getUTCFullYear();
  const yearStart = new Date(Date.UTC(weekYear, 0, 1));
  const week = Math.ceil(
    ((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return `${weekYear}-W${String(week).padStart(2, "0")}`;
}
