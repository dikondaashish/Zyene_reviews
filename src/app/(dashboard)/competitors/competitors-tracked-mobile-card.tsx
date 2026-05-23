"use client";

import { Trash2, ExternalLink, Star, Loader2, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TimeAgo } from "@/components/ui/time-ago";
import type { CompetitorPlacesRowMeta } from "@/lib/competitors/places-snapshot-meta";
import type { Competitor } from "./competitors-types";

export function CompetitorsTrackedMobileCard({
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
        <div
            key={`card-${competitor.id}`}
            className="min-w-0 rounded-lg border bg-card p-3 shadow-sm sm:p-4"
        >
            <div className="flex min-w-0 items-start gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold leading-snug break-words">{competitor.name}</p>
                        {syncing ? (
                            <Badge variant="secondary" className="flex shrink-0 items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Syncing…
                            </Badge>
                        ) : null}
                    </div>
                    {places?.summary ? (
                        <p
                            className="text-xs leading-relaxed text-muted-foreground"
                            title={places.summary}
                        >
                            {places.summary}
                        </p>
                    ) : null}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => onDeleteRequest(competitor.id)}
                    className="mt-0.5 shrink-0 self-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove ${competitor.name}`}
                >
                    {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}
                </Button>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-3 text-sm">
                <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Category
                    </dt>
                    <dd className="mt-0.5 text-muted-foreground">
                        {syncing ? (
                            "—"
                        ) : places?.primaryType ? (
                            <span title={places.typesPreview ?? undefined}>{places.primaryType}</span>
                        ) : (
                            "—"
                        )}
                    </dd>
                </div>
                <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Avg rating
                    </dt>
                    <dd className="mt-0.5">
                        {syncing ? (
                            <span className="text-muted-foreground">—</span>
                        ) : (
                            <span className="inline-flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 shrink-0 fill-chart-4 text-chart-4" />
                                {competitor.average_rating || "—"}
                            </span>
                        )}
                    </dd>
                </div>
                <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Reviews
                    </dt>
                    <dd className="mt-0.5">
                        {syncing ? (
                            <span className="text-muted-foreground">—</span>
                        ) : (
                            (competitor.total_reviews || 0).toLocaleString()
                        )}
                    </dd>
                </div>
                <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Updated
                    </dt>
                    <dd className="mt-0.5 text-xs text-muted-foreground">{updatedAt}</dd>
                </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3 text-xs">
                {!syncing && places?.websiteUrl ? (
                    <a
                        href={places.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        Website
                    </a>
                ) : null}
                {competitor.google_url ? (
                    <a
                        href={competitor.google_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                        Maps
                        <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                ) : (
                    <span className="text-muted-foreground">Maps: N/A</span>
                )}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Source: {sourceLabel}</p>
        </div>
    );
}
