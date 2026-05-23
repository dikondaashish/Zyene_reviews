import type { Competitor } from "./competitors-types";

export function competitorsListIsSyncing(competitor: Competitor, mounted: boolean): boolean {
    if (competitor.average_rating !== 0 && competitor.average_rating !== null) return false;
    if (competitor.total_reviews !== 0) return false;

    // During hydration, return a stable value (false) to match server
    if (!mounted) return false;

    // Consider it syncing if created less than 2 minutes ago
    const createdAt = new Date(competitor.created_at || "");
    const now = new Date();
    const minutesAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    return minutesAgo < 2;
}
