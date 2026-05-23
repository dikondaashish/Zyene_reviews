"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { CompetitorPlacesRowMeta } from "@/lib/competitors/places-snapshot-meta";
import type { Competitor, CompetitorSnapshot } from "./competitors-types";
import { getCompetitorSourceLabel } from "./competitors-table-source-label";
import { CompetitorsTrackedMobileCard } from "./competitors-tracked-mobile-card";
import { CompetitorsTrackedDesktopTable } from "./competitors-tracked-desktop-table";

export function CompetitorsTrackedSection({
    competitors,
    activePlacesMetaByCompetitorId,
    latestSnapshotByCompetitor,
    isSyncing,
    isDeleting,
    onDeleteRequest,
}: {
    competitors: Competitor[];
    activePlacesMetaByCompetitorId: Record<string, CompetitorPlacesRowMeta>;
    latestSnapshotByCompetitor: Map<string, CompetitorSnapshot>;
    isSyncing: (competitor: Competitor) => boolean;
    isDeleting: string | null;
    onDeleteRequest: (id: string) => void;
}) {
    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle>Tracked Competitors</CardTitle>
                <CardDescription>
                    Ratings and reviews from Google Places. Primary category, website, and short
                    description come from public listing data after sync — not competitors&apos; private
                    search-keyword reports.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
                <div className="space-y-3 lg:hidden">
                    {competitors.map((competitor) => {
                        const syncing = isSyncing(competitor);
                        const places = activePlacesMetaByCompetitorId[competitor.id];
                        const sourceLabel = getCompetitorSourceLabel(
                            latestSnapshotByCompetitor.get(competitor.id)
                        );

                        return (
                            <CompetitorsTrackedMobileCard
                                key={`card-${competitor.id}`}
                                competitor={competitor}
                                syncing={syncing}
                                places={places}
                                sourceLabel={sourceLabel}
                                isDeleting={isDeleting === competitor.id}
                                onDeleteRequest={onDeleteRequest}
                            />
                        );
                    })}
                </div>
                <CompetitorsTrackedDesktopTable
                    competitors={competitors}
                    activePlacesMetaByCompetitorId={activePlacesMetaByCompetitorId}
                    latestSnapshotByCompetitor={latestSnapshotByCompetitor}
                    isSyncing={isSyncing}
                    isDeleting={isDeleting}
                    onDeleteRequest={onDeleteRequest}
                />
            </CardContent>
        </Card>
    );
}
