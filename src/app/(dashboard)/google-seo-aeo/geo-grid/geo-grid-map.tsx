import type { GeoGridPoint } from "./load-geo-grid-page-data";

/**
 * The grid itself.
 *
 * Three visual states, not two: ranked, searched-but-not-found, and no data.
 * The pre-Phase-1 heatmap this replaces had no "not found" — every cell always
 * showed a number, because the number came from the business's star rating
 * rather than a search. A cell Google answered with "you are not in the local
 * pack here" is a real, useful finding and is rendered as such.
 */
function cellClass(rank: number | null, searched: boolean): string {
    if (!searched) return "border border-dashed bg-transparent text-muted-foreground";
    if (rank === null) return "bg-muted text-muted-foreground";
    if (rank <= 3) return "bg-chart-2 text-white";
    if (rank <= 10) return "bg-chart-4 text-white";
    return "bg-sync-action text-white";
}

export function GeoGridMap({ size, points }: { size: number; points: GeoGridPoint[] }) {
    const byCell = new Map(points.map((p) => [`${p.row}:${p.col}`, p]));
    const rows = Array.from({ length: size }, (_, row) => row);
    const cols = Array.from({ length: size }, (_, col) => col);
    const center = (size - 1) / 2;

    return (
        <div className="space-y-3">
            <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
            >
                <span className="sr-only">{size} by {size} local rank grid</span>
                {rows.map((row) =>
                    cols.map((col) => {
                        const point = byCell.get(`${row}:${col}`);
                        const searched = point?.searchStatus === "searched";
                        const isCenter = row === center && col === center;
                        const label =
                            !searched ? "-" : point?.rankPosition === null ? "NF" : String(point?.rankPosition);
                        const competitors = point?.topCompetitors.map((item) => `${item.position}. ${item.name}`).join(", ");
                        const title =
                            !searched
                                ? "Not searched"
                                : point.rankPosition === null
                                  ? "Searched — not in the local pack here"
                                  : `Rank ${point.rankPosition}${competitors ? ` · Ahead here: ${competitors}` : ""}`;

                        return (
                            <div
                                key={`${row}:${col}`}
                                title={title}
                                className={`flex aspect-square items-center justify-center rounded text-xs font-semibold ${cellClass(
                                    point?.rankPosition ?? null,
                                    searched
                                )} ${isCenter ? "ring-foreground ring-2 ring-offset-1" : ""}`}
                            >
                                {label}
                            </div>
                        );
                    })
                )}
            </div>

            <CompetitorOverlay points={points} />

            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                    <span className="bg-chart-2 inline-block size-3 rounded" /> Top 3
                </span>
                <span className="flex items-center gap-1">
                    <span className="bg-chart-4 inline-block size-3 rounded" /> 4–10
                </span>
                <span className="flex items-center gap-1">
                    <span className="bg-sync-action inline-block size-3 rounded" /> 11–20
                </span>
                <span className="flex items-center gap-1">
                    <span className="bg-muted inline-block size-3 rounded border" /> Not in local pack
                </span>
                <span className="flex items-center gap-1">
                    <span className="inline-block size-3 rounded border border-dashed" /> Search failed
                </span>
                <span className="ring-foreground ml-1 rounded px-1 ring-2">Your location</span>
            </div>
        </div>
    );
}

function CompetitorOverlay({ points }: { points: GeoGridPoint[] }) {
    const cells = new Map<string, number>();
    for (const point of points) for (const competitor of point.topCompetitors) cells.set(competitor.name, (cells.get(competitor.name) ?? 0) + 1);
    const leaders = [...cells].sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (!leaders.length) return null;
    return <div><p className="text-sm font-medium">Competitor overlay</p><div className="mt-2 flex flex-wrap gap-2">{leaders.map(([name, count]) => <span key={name} className="rounded border px-2 py-1 text-xs">{name} · {count} cells</span>)}</div></div>;
}
