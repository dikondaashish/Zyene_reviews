export const DEFAULT_RATING_ALERT_DELTA = 0.2;
export const DEFAULT_REVIEW_SPIKE_THRESHOLD = 20;

export function sameUtcDay(aIso: string | null | undefined, b: Date): boolean {
    if (!aIso) return false;
    const a = new Date(aIso);
    return (
        a.getUTCFullYear() === b.getUTCFullYear() &&
        a.getUTCMonth() === b.getUTCMonth() &&
        a.getUTCDate() === b.getUTCDate()
    );
}
