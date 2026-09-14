import { Search, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SearchConsoleSectionContent } from "./load-search-console-section";

function formatPercent(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
}

/** E-2: real Search Console query data, only ever rendered once a grant exists - see load-search-console-section.ts. */
export function SearchConsoleSection({ content }: { content: SearchConsoleSectionContent }) {
    return (
        <Card className="overflow-hidden border">
            <CardHeader className="border-b bg-muted/25">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Search className="size-4" />
                    Search Console
                </CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
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
                    <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">
                            {content.siteUrl} · {content.startDate} to {content.endDate}
                        </p>
                        {content.queries.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No search queries recorded for this window.</p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full min-w-[38rem] text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                                            <th className="px-3 py-2.5 font-medium">Query</th>
                                            <th className="px-3 py-2.5 text-right font-medium">Clicks</th>
                                            <th className="px-3 py-2.5 text-right font-medium">Impressions</th>
                                            <th className="px-3 py-2.5 text-right font-medium">CTR</th>
                                            <th className="px-3 py-2.5 text-right font-medium">Avg. position</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {content.queries.map((row) => (
                                            <tr
                                                key={row.query}
                                                className="border-b transition-colors last:border-0 hover:bg-muted/35"
                                            >
                                                <td className="max-w-[240px] truncate px-3 py-2.5">{row.query}</td>
                                                <td className="px-3 py-2.5 text-right tabular-nums">{row.clicks}</td>
                                                <td className="px-3 py-2.5 text-right tabular-nums">
                                                    {row.impressions}
                                                </td>
                                                <td className="px-3 py-2.5 text-right tabular-nums">
                                                    {formatPercent(row.ctr)}
                                                </td>
                                                <td className="px-3 py-2.5 text-right tabular-nums">
                                                    {row.position.toFixed(1)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
