"use client";

import { Hash } from "lucide-react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type CompetitorsListKeywordsCardProps = {
    activeOwnSearchKeywords: Array<{ keyword: string; impressions: number; monthStart: string }>;
    activeKeywordDiscoverySplit: { discoveryPct: number; directPct: number };
};

export function CompetitorsListKeywordsCard({
    activeOwnSearchKeywords,
    activeKeywordDiscoverySplit,
}: CompetitorsListKeywordsCardProps) {
    if (activeOwnSearchKeywords.length === 0) return null;

    return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Hash className="text-muted-foreground size-5" />
                        Your Google search terms
                    </CardTitle>
                    <CardDescription>
                        Monthly search impressions for your listing from Google Business Profile.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {activeKeywordDiscoverySplit.directPct + activeKeywordDiscoverySplit.discoveryPct > 0 ? (
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                                {activeKeywordDiscoverySplit.discoveryPct}% discovery
                            </span>{" "}
                            vs{" "}
                            <span className="font-medium text-foreground">
                                {activeKeywordDiscoverySplit.directPct}% name/brand
                            </span>
                        </p>
                    ) : null}
                    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {activeOwnSearchKeywords.slice(0, 12).map((k) => (
                            <li
                                key={`${k.monthStart}-${k.keyword}`}
                                className="flex min-w-0 flex-col gap-1 rounded-md border bg-muted/20 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-2"
                            >
                                <span className="break-words font-medium" title={k.keyword}>
                                    {k.keyword}
                                </span>
                                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                    {k.impressions.toLocaleString()} imp.
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-muted-foreground">
                        <Link href="/analytics" className="text-primary underline underline-offset-2">
                            View full keyword list in Analytics
                        </Link>
                    </p>
                </CardContent>
            </Card>
    );
}
