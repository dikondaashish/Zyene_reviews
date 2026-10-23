/**
 * "You vs. your competitors" in owner terms. Ratings are compared like for
 * like: your all-time Google average against each competitor's all-time
 * Google average. (The old benchmark ranked your period-only average against
 * their lifetime averages, which flattered or punished you by accident.)
 */
export type ScoreboardInput = {
    own: { name: string; rating: number | null; totalReviews: number | null; newReviews: number };
    competitors: Array<{ id: string; name: string; rating: number | null; totalReviews: number | null; newReviews: number | null }>;
};

export type ScoreboardRow = {
    id: string;
    name: string;
    isYou: boolean;
    rating: number | null;
    totalReviews: number | null;
    /** Reviews gained in the selected period; null when we lack two data points to compare. */
    newReviews: number | null;
};

export type Scoreboard = {
    rows: ScoreboardRow[];
    /** 1-based position among businesses with a rating; null when you have no rating yet. */
    ratingRank: number | null;
    ratedCount: number;
    headline: string;
    details: string[];
};

const byRating = (a: ScoreboardRow, b: ScoreboardRow) =>
    (b.rating ?? -1) - (a.rating ?? -1) || (b.totalReviews ?? 0) - (a.totalReviews ?? 0);

function plural(n: number, word: string) {
    return `${n.toLocaleString("en-US")} ${word}${n === 1 ? "" : "s"}`;
}

export function buildScoreboard({ own, competitors }: ScoreboardInput, periodLabel: string): Scoreboard {
    const you: ScoreboardRow = { id: "you", name: own.name, isYou: true, rating: own.rating, totalReviews: own.totalReviews, newReviews: own.newReviews };
    const rows = [you, ...competitors.map((c) => ({ ...c, isYou: false }))].sort(byRating);
    const rated = rows.filter((r) => r.rating !== null && r.rating > 0);
    const ratingRank = you.rating ? rated.findIndex((r) => r.isYou) + 1 : null;
    const others = rows.filter((r) => !r.isYou);

    const headline = ratingRank === null
        ? "Your Google rating isn't available yet"
        : rated.length === 1
          ? "Your competitors' ratings haven't loaded yet"
          : rated[0].rating === you.rating
            ? (rated[1]?.rating === you.rating
                ? `You're tied for the best Google rating of ${rated.length} businesses`
                : `You have the best Google rating of ${rated.length} businesses`)
            : `You're #${ratingRank} of ${rated.length} on Google rating`;

    const details: string[] = [];
    const topByReviews = [...others].sort((a, b) => (b.totalReviews ?? 0) - (a.totalReviews ?? 0))[0];
    if (topByReviews?.totalReviews && own.totalReviews != null) {
        if (own.totalReviews >= topByReviews.totalReviews) {
            details.push("You have at least as many reviews as any competitor you track.");
        } else {
            const ratio = own.totalReviews > 0 ? topByReviews.totalReviews / own.totalReviews : null;
            details.push(
                ratio && ratio >= 1.5
                    ? `${topByReviews.name} has about ${ratio.toFixed(ratio >= 10 ? 0 : 1)}× as many reviews as you.`
                    : `${topByReviews.name} has ${plural(topByReviews.totalReviews - own.totalReviews, "more review")} than you.`,
            );
        }
    }

    // Pace is reported separately from rating rank: a competitor ranked below you on
    // rating can still be collecting reviews faster, and the owner should hear about it.
    const withPace = others.filter((r) => r.newReviews !== null);
    const faster = withPace.filter((r) => (r.newReviews ?? 0) > own.newReviews).sort((a, b) => (b.newReviews ?? 0) - (a.newReviews ?? 0));
    const period = `In the last ${periodLabel.toLowerCase()}`;
    if (faster.length === 1) {
        details.push(`${period}, ${faster[0].name} gained ${plural(faster[0].newReviews ?? 0, "review")}; you gained ${own.newReviews}.`);
    } else if (faster.length > 1) {
        const list = faster.map((r) => `${r.name} +${r.newReviews}`).join(", ");
        details.push(`${period}, ${faster.length} competitors got more new reviews than you (${list}); you gained ${own.newReviews}.`);
    } else if (withPace.length > 0) {
        details.push(`${period}, you gained at least as many new reviews as any competitor.`);
    }

    return { rows, ratingRank, ratedCount: rated.length, headline, details };
}
