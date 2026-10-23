"use client";

import { Trash2, ExternalLink, Star, Loader2, Globe } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TimeAgo } from "@/components/ui/time-ago";
import type { CompetitorPlacesRowMeta } from "@/lib/competitors/places-snapshot-meta";
import { BusinessLogo } from "@/components/competitors/business-logo";
import { withMapsQuery } from "@/lib/google/maps-listing-url";
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
    const updatedAt = competitor.updated_at ? <TimeAgo date={competitor.updated_at} /> : "Not yet";

    return (
        <TableRow key={competitor.id}>
            <TableCell className="font-medium align-top">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <BusinessLogo name={competitor.name} website={places?.websiteUrl} className="size-7" />
                        {competitor.name}
                        {syncing && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Loader2 className="animate-spin size-3" />
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
                    "Updating…"
                ) : places?.primaryType ? (
                    <span title={places.typesPreview ?? undefined}>{places.primaryType}</span>
                ) : (
                    "Not listed"
                )}
            </TableCell>
            <TableCell className="align-top">
                <div className="flex items-center text-sm">
                    {syncing ? (
                        <span className="text-muted-foreground">Updating…</span>
                    ) : (
                        <>
                            {competitor.average_rating ? <Star className="text-chart-4 mr-1 size-4" aria-hidden /> : null}
                            {competitor.average_rating || "Not loaded"}
                        </>
                    )}
                </div>
            </TableCell>
            <TableCell className="align-top">
                {syncing ? (
                    <span className="text-muted-foreground">Updating…</span>
                ) : (
                    (competitor.total_reviews || 0).toLocaleString("en-US")
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
                        <Globe className="shrink-0 size-3.5" />
                        Website
                    </a>
                ) : (
                    <span className="text-muted-foreground text-xs">Not listed</span>
                )}
            </TableCell>
            <TableCell className="align-top">
                {competitor.google_url ? (
                    <a
                        href={withMapsQuery(competitor.google_url, competitor.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:underline text-xs"
                    >
                        Open <ExternalLink className="ml-1 size-3" />
                    </a>
                ) : (
                    <span className="text-muted-foreground text-xs">Not linked</span>
                )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground align-top">
                <div className="space-y-1">
                    <div>{updatedAt}</div>
                    <div className="text-[11px]">{sourceLabel}</div>
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
                        <Loader2 className="animate-spin size-4" />
                    ) : (
                        <Trash2 className="size-4" />
                    )}
                </Button>
            </TableCell>
        </TableRow>
    );
}
