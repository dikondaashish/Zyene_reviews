"use client";

import { ExternalLink, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { PlaceLinkRow } from "./place-action-links-manager-types";
import { prettyPlaceActionUrl } from "./place-action-links-manager-utils";

export function PlaceActionLinksManagerLinksTable({
    links,
    displayForType,
    deletingId,
    onDelete,
}: {
    links: PlaceLinkRow[];
    displayForType: (type: string) => string;
    deletingId: string | null;
    onDelete: (linkId: string) => void;
}) {
    if (links.length === 0) {
        return <p className="text-sm text-muted-foreground">No place action links synced yet.</p>;
    }

    return (
        <div className="overflow-x-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[220px]">Type</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead className="w-[170px]">Flags</TableHead>
                        <TableHead className="w-[72px] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {links.map((row) => {
                        const parsedUrl = prettyPlaceActionUrl(row.uri);
                        return (
                            <TableRow key={row.id}>
                                <TableCell className="align-top text-sm font-medium">
                                    {displayForType(row.place_action_type)}
                                </TableCell>
                                <TableCell className="align-top min-w-[360px] max-w-[640px]">
                                    <a
                                        href={row.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group inline-flex max-w-full items-start gap-1 text-sm text-primary hover:underline"
                                        title={row.uri}
                                    >
                                        <span className="min-w-0">
                                            <span className="block truncate font-medium">{parsedUrl.host}</span>
                                            {parsedUrl.path ? (
                                                <span className="block truncate text-xs text-muted-foreground group-hover:text-primary/80">
                                                    {parsedUrl.path}
                                                </span>
                                            ) : null}
                                        </span>
                                        <ExternalLink className="mt-0.5 shrink-0 size-3.5" />
                                    </a>
                                </TableCell>
                                <TableCell className="align-top">
                                    <div className="flex min-h-8 flex-wrap gap-1">
                                        {row.is_preferred && <Badge variant="secondary">Preferred</Badge>}
                                        {row.is_broken && <Badge variant="destructive">Possibly broken</Badge>}
                                        {!row.is_preferred && !row.is_broken ? (
                                            <span className="text-xs text-muted-foreground">,</span>
                                        ) : null}
                                    </div>
                                </TableCell>
                                <TableCell className="align-top text-right">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => onDelete(row.id)}
                                        disabled={deletingId === row.id}
                                        aria-label="Remove link"
                                    >
                                        {deletingId === row.id ? (
                                            <Loader2 className="animate-spin size-4" />
                                        ) : (
                                            <Trash2 className="size-4" />
                                        )}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
