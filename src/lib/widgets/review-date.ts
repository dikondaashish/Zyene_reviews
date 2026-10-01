export function relativeReviewDate(value: string, now = Date.now()): string {
    const time = Date.parse(value);
    if (!Number.isFinite(time)) return "";
    const days = Math.max(0, Math.floor((now - time) / 86400000));
    if (!days) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? "" : "s"} ago`;
}
