import type { CompetitorRangeKey } from "@/lib/competitors/date-range";

export async function prefetchCompetitorsRange(range: CompetitorRangeKey) {
    const response = await fetch(`/api/competitors/range-meta?range=${range}`, {
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error("Failed to prefetch competitors range");
    }
    return response.json();
}
