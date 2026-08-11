import { Search, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SearchConsoleSectionContent } from "./load-search-console-section";

function formatPercent(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
}

/** E-2: real Search Console query data, only ever rendered once a grant exists — see load-search-console-section.ts. */
export function SearchConsoleSection({ content }: { content: SearchConsoleSectionContent }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Search className="size-4" />
                    Search Console
                </CardTitle>
            </CardHeader>
            <CardContent>
                {content.kind === "error" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="size-4 shrink-0" />
                        {content.message}
                    </div>
                )}
                {content.kind === "no_properties" && (
                    <p className="text-sm text-muted-foreground">
                        Search Console is connected, but this Google account has no verified
                        properties for us to read.
                    </p>
                )}
                {content.kind === "ok" && (
                    <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">
                            {content.siteUrl} · {content.startDate} to {content.endDate}
                        </p>
                        {content.queries.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No search queries recorded for this window.
                            </p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-1.5 font-medium">Query</th>
                                        <th className="py-1.5 font-medium text-right">Clicks</th>
                                        <th className="py-1.5 font-medium text-right">Impressions</th>
                                        <th className="py-1.5 font-medium text-right">CTR</th>
                                        <th className="py-1.5 font-medium text-right">Avg. position</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {content.queries.map((row) => (
                                        <tr key={row.query} className="border-b last:border-0">
                                            <td className="py-1.5 truncate max-w-[240px]">{row.query}</td>
                                            <td className="py-1.5 text-right">{row.clicks}</td>
                                            <td className="py-1.5 text-right">{row.impressions}</td>
                                            <td className="py-1.5 text-right">{formatPercent(row.ctr)}</td>
                                            <td className="py-1.5 text-right">{row.position.toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
