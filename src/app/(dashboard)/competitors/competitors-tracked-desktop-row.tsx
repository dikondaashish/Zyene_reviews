"use client";

import { Trash2, ExternalLink, Star, Loader2, Globe } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TimeAgo } from "@/components/ui/time-ago";
import type { CompetitorPlacesRowMeta } from "@/lib/competitors/places-snapshot-meta";
import type { Competitor } from "./competitors-types";

export function CompetitorsTrackedDesktopRow({
    competitor,
    syncing,
    places,
    sourceLabel,
    isDeleting,
    onDeleteRequest,
}: {
    competitor: Competitor;
    syncing: boolean;
    places: CompetitorPlacesRowMeta | undefined;
    sourceLabel: string;
    isDeleting: boolean;
    onDeleteRequest: (id: string) => void;
}) {
    const updatedAt = competitor.updated_at ? (
        <TimeAgo date={competitor.updated_at} />
    ) : (
        "—"
    );

    return (
        <TableRow key={competitor.id}>
            <TableCell className="font-medium align-top">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        {competitor.name}
                        {syncing && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Syncing...
                            </Badge>
                        )}
                    </div>
                    {places?.summary ? (
                        <p
                            className="text-[11px] font-normal text-muted-foreground line-clamp-2 max-w-[280px]"
                            title={places.summary}
                        >
                            {places.summary}
                        </p>
                    ) : null}
                </div>
            </TableCell>
            <TableCell className="align-top text-sm text-muted-foreground">
                {syncing ? (
                    "—"
                ) : places?.primaryType ? (
                    <span title={places.typesPreview ?? undefined}>{places.primaryType}</span>
                ) : (
                    "—"
                )}
            </TableCell>
            <TableCell className="align-top">
                <div className="flex items-center text-sm">
                    {syncing ? (
                        <span className="text-muted-foreground">—</span>
                    ) : (
                        <>
                            <Star className="h-4 w-4 text-chart-4 fill-chart-4 mr-1" />
                            {competitor.average_rating || "—"}
                        </>
                    )}
                </div>
            </TableCell>
            <TableCell className="align-top">
                {syncing ? (
                    <span className="text-muted-foreground">—</span>
                ) : (
                    competitor.total_reviews || 0
                )}
            </TableCell>
            <TableCell className="align-top">
                {!syncing && places?.websiteUrl ? (
                    <a
                        href={places.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                    >
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        Site
                    </a>
                ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                )}
            </TableCell>
            <TableCell className="align-top">
                {competitor.google_url ? (
                    <a
                        href={competitor.google_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:underline text-xs"
                    >
                        View <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                ) : (
                    <span className="text-muted-foreground text-xs">N/A</span>
                )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground align-top">
                <div className="space-y-1">
                    <div>{updatedAt}</div>
                    <div className="text-[11px]">Source: {sourceLabel}</div>
                </div>
            </TableCell>
            <TableCell className="text-right">
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => onDeleteRequest(competitor.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                    {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}
                </Button>
            </TableCell>
        </TableRow>
    );
}
