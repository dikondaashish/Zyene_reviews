import type { Scoreboard } from "@/lib/competitors/scoreboard";

function Tile({ label, you, them, themLabel }: { label: string; you: string; them: string | null; themLabel: string | null }) {
    return (
        <div className="min-w-0 rounded-lg border bg-card px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-semibold tabular-nums text-foreground">{you}</span>
                <span className="text-xs text-muted-foreground">you</span>
            </p>
            {them ? <p className="mt-0.5 truncate text-xs text-muted-foreground">vs {them} · {themLabel}</p> : null}
        </div>
    );
}

/** Real numbers, not AI prose: the three facts the summary is built on, readable in a glance. */
export function CompetitorsBriefGlance({ scoreboard, split }: {
    scoreboard: Scoreboard;
    split: { discoveryPct: number; directPct: number };
}) {
    const you = scoreboard.rows.find((r) => r.isYou);
    const others = scoreboard.rows.filter((r) => !r.isYou);
    const bestRated = [...others].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];
    const mostReviewed = [...others].sort((a, b) => (b.totalReviews ?? 0) - (a.totalReviews ?? 0))[0];
    const hasSplit = split.discoveryPct + split.directPct > 0;

    return (
        <div className="grid gap-3 sm:grid-cols-3">
            <Tile
                label="Google rating"
                you={you?.rating ? `${you.rating.toFixed(1)}★` : "Not loaded"}
                them={bestRated?.rating ? `${bestRated.rating.toFixed(1)}★` : null}
                themLabel={bestRated?.name ?? null}
            />
            <Tile
                label="Reviews"
                you={you?.totalReviews != null ? you.totalReviews.toLocaleString("en-US") : "Not loaded"}
                them={mostReviewed?.totalReviews ? mostReviewed.totalReviews.toLocaleString("en-US") : null}
                themLabel={mostReviewed?.name ?? null}
            />
            <div className="min-w-0 rounded-lg border bg-card px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground">How people find you on Google</p>
                {hasSplit ? (
                    <>
                        <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-muted" role="img"
                            aria-label={`${split.discoveryPct}% searched for what you offer, ${split.directPct}% searched your name`}>
                            <div className="bg-primary" style={{ width: `${split.discoveryPct}%` }} />
                            <div className="bg-primary/35" style={{ width: `${split.directPct}%` }} />
                        </div>
                        <p className="mt-1.5 flex justify-between gap-2 text-xs text-muted-foreground">
                            <span><strong className="font-semibold text-foreground">{split.discoveryPct}%</strong> what you offer</span>
                            <span><strong className="font-semibold text-foreground">{split.directPct}%</strong> your name</span>
                        </p>
                    </>
                ) : (
                    <p className="mt-1 text-sm text-muted-foreground">Not enough search data yet.</p>
                )}
            </div>
        </div>
    );
}

