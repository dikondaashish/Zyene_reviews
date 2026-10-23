"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, MessageSquare, MoreHorizontal, Pause, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { Campaign } from "./campaigns-list-types";
import { CHANNEL_LABEL, getCampaignStatusNote, type CampaignStatusNote } from "./campaign-presentation";

const TONE: Record<CampaignStatusNote["tone"], { pill: string; dot: string }> = {
    success: { pill: "bg-success/10 text-success", dot: "bg-success" },
    warning: { pill: "bg-warning/15 text-warning-foreground", dot: "bg-warning" },
    muted: { pill: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/50" },
};

function Stat({ value, label }: { value: string; label: string }) {
    return (
        <span>
            <strong className="font-semibold tabular-nums text-foreground">{value}</strong> {label}
        </span>
    );
}

export function CampaignRow({ campaign, onToggle, onDelete, responseRate }: {
    campaign: Campaign;
    onToggle: () => void;
    onDelete: () => void;
    responseRate: number;
}) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const status = getCampaignStatusNote(campaign);
    const tone = TONE[status.tone];
    const ChannelIcon = campaign.channel === "email" ? Mail : MessageSquare;
    const href = `/campaigns/${campaign.id}`;
    const isDraft = campaign.status === "draft";
    // Drafts must be started before customers can be added (sends require an active campaign).
    const canToggle = campaign.status === "active" || campaign.status === "paused" || isDraft;

    return (
        <li className="flex flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <Link href={href} className="ui-card-title truncate text-foreground hover:underline">{campaign.name}</Link>
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", tone.pill)}>
                        <span className={cn("size-1.5 rounded-full", tone.dot)} aria-hidden />
                        {status.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <ChannelIcon className="size-3.5" aria-hidden />
                        {CHANNEL_LABEL[campaign.channel] ?? campaign.channel}
                    </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{status.note}</p>
                {campaign.total_sent > 0 ? (
                    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <Stat value={campaign.total_sent.toLocaleString("en-US")} label="asked" />
                        <Stat value={campaign.total_opened.toLocaleString("en-US")} label="opened" />
                        <Stat value={(campaign.total_completed || 0).toLocaleString("en-US")} label={`responded (${responseRate}%)`} />
                        {campaign.total_reviews_received > 0 ? (
                            <Stat value={campaign.total_reviews_received.toLocaleString("en-US")} label="confirmed reviews" />
                        ) : null}
                    </p>
                ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
                {canToggle ? (
                    <Button variant={isDraft ? "default" : "outline"} size="sm" onClick={onToggle} className="gap-1.5">
                        {campaign.status === "active" ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                        {campaign.status === "active" ? "Pause" : isDraft ? "Start campaign" : "Resume"}
                    </Button>
                ) : null}
                <Button variant="outline" size="sm" asChild className="gap-1.5">
                    <Link href={href}>
                        {isDraft ? "Open" : "View results"}
                        <ArrowRight className="size-3.5" />
                    </Link>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8" aria-label={`More options for ${campaign.name}`}>
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>
                            <Trash2 className="size-4" />Delete campaign
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete &ldquo;{campaign.name}&rdquo;?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This can&apos;t be undone. Requests already sent stay on the Requests page, and your customers stay in your customer list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep campaign</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete campaign
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </li>
    );
}
