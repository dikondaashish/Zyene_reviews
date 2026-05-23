"use client";

import Link from "next/link";
import { Pause, Play, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Campaign } from "./campaigns-list-types";
import { channelConfig, statusConfig } from "./campaigns-list-types";

export function CampaignsListSection({
    campaigns,
    toggleStatus,
    deleteCampaign,
    getOpenedPercent,
    getCompletedPercent,
}: {
    campaigns: Campaign[];
    toggleStatus: (campaign: Campaign) => void;
    deleteCampaign: (id: string) => void;
    getOpenedPercent: (c: Campaign) => number;
    getCompletedPercent: (c: Campaign) => number;
}) {
    return (
        <div className="grid gap-4">
            {campaigns.map((campaign) => {
                const status = statusConfig[campaign.status] || statusConfig.draft;
                const channel = channelConfig[campaign.channel] || channelConfig.sms;
                const ChannelIcon = channel.icon;

                return (
                    <Card key={campaign.id} className="hover:border-primary/30 transition-colors">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Link
                                            href={`/campaigns/${campaign.id}`}
                                            className="text-lg font-semibold hover:underline truncate"
                                        >
                                            {campaign.name}
                                        </Link>
                                        <Badge
                                            variant={status.variant}
                                            className={
                                                campaign.status === "active"
                                                    ? "bg-chart-2/15 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2"
                                                    : campaign.status === "paused"
                                                      ? "bg-chart-4/15 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4"
                                                      : ""
                                            }
                                        >
                                            {status.label}
                                        </Badge>
                                        <Badge variant="outline" className={channel.color}>
                                            <ChannelIcon className="mr-1 size-3" />
                                            {channel.label}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>
                                            Sent: <strong className="text-foreground">{campaign.total_sent}</strong>
                                        </span>
                                        <span>
                                            Opened: <strong className="text-foreground">{getOpenedPercent(campaign)}%</strong>
                                        </span>
                                        <span>
                                            Completed: <strong className="text-foreground">{getCompletedPercent(campaign)}%</strong>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    {(campaign.status === "active" || campaign.status === "paused") && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleStatus(campaign)}
                                            title={campaign.status === "active" ? "Pause" : "Resume"}
                                        >
                                            {campaign.status === "active" ? (
                                                <Pause className="size-4" />
                                            ) : (
                                                <Play className="size-4" />
                                            )}
                                        </Button>
                                    )}

                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/campaigns/${campaign.id}`}>
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete &ldquo;{campaign.name}&rdquo; and all its data. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => deleteCampaign(campaign.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
