"use client";

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { CompetitorPlacesRowMeta } from "@/lib/competitors/places-snapshot-meta";
import type { Competitor, CompetitorSnapshot } from "./competitors-types";
import { getCompetitorSourceLabel } from "./competitors-table-source-label";
import { CompetitorsTrackedDesktopRow } from "./competitors-tracked-desktop-row";

export function CompetitorsTrackedDesktopTable({
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
        <div className="hidden overflow-x-auto lg:block">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[140px]">Competitor Name</TableHead>
                        <TableHead className="min-w-[120px]">Primary category</TableHead>
                        <TableHead>Avg Rating</TableHead>
                        <TableHead>Total Reviews</TableHead>
                        <TableHead className="min-w-[90px]">Website</TableHead>
                        <TableHead className="min-w-[90px]">Maps</TableHead>
                        <TableHead className="min-w-[120px]">Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {competitors.map((competitor) => (
                        <CompetitorsTrackedDesktopRow
                            key={competitor.id}
                            competitor={competitor}
                            syncing={isSyncing(competitor)}
                            places={activePlacesMetaByCompetitorId[competitor.id]}
                            sourceLabel={getCompetitorSourceLabel(
                                latestSnapshotByCompetitor.get(competitor.id)
                            )}
                            isDeleting={isDeleting === competitor.id}
                            onDeleteRequest={onDeleteRequest}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
