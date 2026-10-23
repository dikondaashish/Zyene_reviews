"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Scoreboard } from "@/lib/competitors/scoreboard";
import { BusinessLogo } from "@/components/competitors/business-logo";

/** Google sometimes removes reviews, so a period can go negative; show it as it is. */
function signed(value: number): string {
    return value > 0 ? `+${value}` : String(value);
}

function NewReviews({ value }: { value: number | null }) {
    if (value === null) return <span className="text-muted-foreground" title="Needs two updates in this period to compare">Not enough data</span>;
    return <span className={cn("tabular-nums", value > 0 ? "text-foreground" : "text-muted-foreground")}>{signed(value)}</span>;
}

/** Verdict first, then one ranked table: the answer to "how am I doing against them?" */
export function CompetitorsScoreboard({
    scoreboard,
    rangeLabel,
    websiteById,
}: {
    scoreboard: Scoreboard;
    rangeLabel: string;
    /** Row id ("you" for the owner) → website, for the logo. */
    websiteById: Record<string, string | null | undefined>;
}) {
    return (
        <section aria-labelledby="competitor-scoreboard-title" className="overflow-hidden rounded-xl border bg-card">
            <header className="border-b border-border px-5 py-4 sm:px-6">
                <h2 id="competitor-scoreboard-title" className="ui-section-title text-foreground">{scoreboard.headline}</h2>
                {scoreboard.details.map((line) => (
                    <p key={line} className="mt-1 text-sm leading-6 text-muted-foreground">{line}</p>
                ))}
                <p className="mt-3 text-xs text-muted-foreground">
                    Rank is by Google star rating, what customers compare first. &ldquo;New&rdquo; shows who is collecting reviews fastest.
                </p>
            </header>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                            <th scope="col" className="w-16 px-4 py-2.5 font-medium sm:px-6">Rank</th>
                            <th scope="col" className="px-3 py-2.5 font-medium">Business</th>
                            <th scope="col" className="px-3 py-2.5 text-right font-medium">Google rating</th>
                            <th scope="col" className="hidden px-3 py-2.5 text-right font-medium sm:table-cell">Total reviews</th>
                            <th scope="col" className="hidden px-5 py-2.5 text-right font-medium sm:table-cell sm:px-6">New in last {rangeLabel.toLowerCase()}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scoreboard.rows.map((row, index) => (
                            <tr key={row.id} className={cn("border-b last:border-0", row.isYou && "bg-primary/5")}>
                                <td className="px-4 py-3 tabular-nums text-muted-foreground sm:px-6">{row.rating ? index + 1 : null}</td>
                                <td className="max-w-[18rem] px-3 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <BusinessLogo name={row.name} website={websiteById[row.id]} className="size-7" />
                                        <div className="min-w-0">
                                            <span className={cn("block truncate", row.isYou ? "font-semibold text-foreground" : "text-foreground")}>
                                                {row.isYou ? `You (${row.name})` : row.name}
                                            </span>
                                            <span className="mt-0.5 block text-xs text-muted-foreground sm:hidden">
                                                {row.totalReviews != null ? `${row.totalReviews.toLocaleString("en-US")} reviews` : "Reviews not loaded"}
                                                {row.newReviews != null ? ` · ${signed(row.newReviews)} new` : ""}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right sm:px-3">
                                    {row.rating ? (
                                        <span className="inline-flex items-center gap-1 font-medium tabular-nums">
                                            <Star className="size-3.5 fill-current text-warning" strokeWidth={0} aria-hidden />
                                            {row.rating.toFixed(1)}
                                        </span>
                                    ) : <span className="text-muted-foreground">Not loaded</span>}
                                </td>
                                <td className="hidden px-3 py-3 text-right tabular-nums sm:table-cell">{row.totalReviews?.toLocaleString("en-US") ?? "Not loaded"}</td>
                                <td className="hidden px-5 py-3 text-right sm:table-cell sm:px-6"><NewReviews value={row.newReviews} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
