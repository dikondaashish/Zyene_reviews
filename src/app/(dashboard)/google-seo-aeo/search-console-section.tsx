import { AlertCircle } from "lucide-react";
import type { SearchConsoleSectionContent } from "./load-search-console-section";
import { SeoSection } from "./seo-section";

/** Owners think in "page one", not in average positions. */
function describeRank(position: number): string {
    if (position <= 3) return "Top 3";
    if (position <= 10) return "Page 1";
    return "Page 2+";
}

function formatPercent(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
}

/** E-2: real Search Console query data, only ever rendered once a grant exists - see load-search-console-section.ts. */
export function SearchConsoleSection({ content }: { content: SearchConsoleSectionContent }) {
    return (
        <SeoSection
            id="search-console-title"
            title="What people search to find you"
            description={
                content.kind === "ok"
                    ? `Google searches where ${content.siteUrl} showed up, ${content.startDate} to ${content.endDate}. A rank of 1 is the top result.`
                    : "From Google Search Console."
            }
            bodyClassName="p-5 sm:p-6"
        >
            {content.kind === "error" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="size-4 shrink-0" />
                    {content.message}
                </div>
            )}
            {content.kind === "no_properties" && (
                <p className="text-sm text-muted-foreground">
                    Search Console is connected, but this Google account has no verified properties for us to read.
                </p>
            )}
            {content.kind === "ok" && (
                <div>
                    {content.queries.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No Google searches showed your site in this period yet.</p>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full min-w-[38rem] text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                                        <th className="px-3 py-2.5 font-medium">What they searched</th>
                                        <th className="px-3 py-2.5 text-right font-medium">Times shown</th>
                                        <th className="px-3 py-2.5 text-right font-medium">Clicks</th>
                                        <th className="px-3 py-2.5 text-right font-medium">Click rate</th>
                                        <th className="px-3 py-2.5 text-right font-medium">Google rank</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {content.queries.map((row) => (
                                        <tr
                                            key={row.query}
                                            className="border-b transition-colors last:border-0 hover:bg-muted/35"
                                        >
                                            <td className="max-w-[240px] truncate px-3 py-2.5">{row.query}</td>
                                            <td className="px-3 py-2.5 text-right tabular-nums">
                                                {row.impressions.toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2.5 text-right tabular-nums">
                                                {row.clicks.toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2.5 text-right tabular-nums">
                                                {formatPercent(row.ctr)}
                                            </td>
                                            <td className="px-3 py-2.5 text-right tabular-nums">
                                                {row.position.toFixed(1)}
                                                <span className="ml-2 inline-block w-14 rounded-full bg-muted px-1.5 py-0.5 text-center text-xs text-muted-foreground">
                                                    {describeRank(row.position)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </SeoSection>
    );
}
