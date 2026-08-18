type Snapshot = { url: string; contentHash: string; citations: number };
type ChangeType = "new" | "updated" | "citation_gain";

export function detectCompetitorPageChanges(previous: readonly Snapshot[], current: readonly Snapshot[]) {
    const before = new Map(previous.map((row) => [row.url, row]));
    return current.flatMap((row) => {
        const old = before.get(row.url);
        const changeTypes: ChangeType[] = [];
        if (!old) changeTypes.push("new");
        else if (old.contentHash !== row.contentHash) changeTypes.push("updated");
        const citationDelta = row.citations - (old?.citations ?? 0);
        if (citationDelta > 0) changeTypes.push("citation_gain");
        return changeTypes.length ? [{ url: row.url, changeTypes, citationDelta }] : [];
    });
}
