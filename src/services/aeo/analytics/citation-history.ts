export type CitationPosition = { url: string; ordinal: number };
export type CitationChange = {
    normalizedUrl: string;
    changeType: "gained" | "lost" | "moved_up" | "moved_down";
    previousOrdinal: number | null;
    currentOrdinal: number | null;
};

/** Compares two observations without inventing a loss when either sample failed. */
export function diffCitationSets(
    previous: readonly CitationPosition[],
    current: readonly CitationPosition[]
): CitationChange[] {
    const before = new Map(previous.map((item) => [item.url, item.ordinal]));
    const after = new Map(current.map((item) => [item.url, item.ordinal]));
    const changes: CitationChange[] = [];

    for (const [url, ordinal] of before) {
        const next = after.get(url);
        if (next === undefined) {
            changes.push({ normalizedUrl: url, changeType: "lost", previousOrdinal: ordinal, currentOrdinal: null });
        } else if (next < ordinal) {
            changes.push({ normalizedUrl: url, changeType: "moved_up", previousOrdinal: ordinal, currentOrdinal: next });
        } else if (next > ordinal) {
            changes.push({ normalizedUrl: url, changeType: "moved_down", previousOrdinal: ordinal, currentOrdinal: next });
        }
    }
    for (const [url, ordinal] of after) {
        if (!before.has(url)) changes.push({ normalizedUrl: url, changeType: "gained", previousOrdinal: null, currentOrdinal: ordinal });
    }
    return changes;
}
