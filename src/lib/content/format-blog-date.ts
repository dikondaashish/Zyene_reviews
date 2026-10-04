/**
 * Format blog `publishedAt` values without SSR/CSR day-boundary mismatches.
 * `YYYY-MM-DD` must be parsed at noon local time; midnight UTC flips the day
 * for US timezones and causes React hydration errors on /blog.
 */

const SHORT_FORMATTER = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

const LONG_FORMATTER = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
});

export function parseBlogPublishedDate(date: string): Date {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return new Date(`${date}T12:00:00`);
    }
    return new Date(date);
}

export function formatBlogPublishedDate(date: string, style: "short" | "long" = "short"): string {
    const formatter = style === "long" ? LONG_FORMATTER : SHORT_FORMATTER;
    return formatter.format(parseBlogPublishedDate(date));
}
