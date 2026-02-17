"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Megaphone,
    Plus,
    Pause,
    Play,
    Pencil,
    Trash2,
    Mail,
    MessageSquare,
    ArrowRight,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";

interface Campaign {
    id: string;
    name: string;
    status: string;
    channel: string;
    trigger_type: string;
    total_sent: number;
    total_opened: number;
    total_clicked: number;
    total_completed: number;
    total_reviews_received: number;
    created_at: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { label: "Active", variant: "default" },
    paused: { label: "Paused", variant: "secondary" },
    draft: { label: "Draft", variant: "outline" },
    completed: { label: "Completed", variant: "secondary" },
};

const channelConfig: Record<string, { label: string; icon: any; color: string }> = {
    sms: { label: "SMS", icon: MessageSquare, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
    email: { label: "Email", icon: Mail, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
    both: { label: "SMS + Email", icon: MessageSquare, color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
};

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchCampaigns = async () => {
        try {
            const res = await fetch("/api/campaigns");
            const data = await res.json();
            setCampaigns(data.campaigns || []);
        } catch (err) {
            console.error("Failed to fetch campaigns:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const toggleStatus = async (campaign: Campaign) => {
        const newStatus = campaign.status === "active" ? "paused" : "active";
        try {
            const res = await fetch(`/api/campaigns/${campaign.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success(`Campaign ${newStatus === "active" ? "resumed" : "paused"}`);
                fetchCampaigns();
            } else {
                toast.error("Failed to update campaign");
            }
        } catch {
            toast.error("Failed to update campaign");
        }
    };

    const deleteCampaign = async (id: string) => {
        try {
            const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Campaign deleted");
                fetchCampaigns();
            } else {
                toast.error("Failed to delete campaign");
            }
        } catch {
            toast.error("Failed to delete campaign");
        }
    };

    const getCompletedPercent = (c: Campaign) => {
        const completed = c.total_completed || c.total_reviews_received || 0;
        return c.total_sent > 0 ? Math.round((completed / c.total_sent) * 100) : 0;
    };
    const getOpenedPercent = (c: Campaign) =>
        c.total_sent > 0 ? Math.round((c.total_opened / c.total_sent) * 100) : 0;

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
                    <p className="text-muted-foreground">
                        Create and manage automated review request campaigns
                    </p>
                </div>
                <Button asChild>
                    <Link href="/campaigns/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Campaign
                    </Link>
                </Button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {/* Empty State */}
            {!loading && campaigns.length === 0 && (
                <Card className="flex flex-col items-center justify-center py-16">
                    <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                        Create one to start collecting reviews automatically. Set it up
                        once, it runs on its own.
                    </p>
                    <Button asChild>
                        <Link href="/campaigns/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Your First Campaign
                        </Link>
                    </Button>
                </Card>
            )}

            {/* Campaign Cards */}
            {!loading && campaigns.length > 0 && (
                <div className="grid gap-4">
                    {campaigns.map((campaign) => {
                        const status = statusConfig[campaign.status] || statusConfig.draft;
                        const channel = channelConfig[campaign.channel] || channelConfig.sms;
                        const ChannelIcon = channel.icon;

                        return (
                            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left: Name + badges */}
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
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                            : campaign.status === "paused"
                                                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                                                : ""
                                                    }
                                                >
                                                    {status.label}
                                                </Badge>
                                                <Badge variant="outline" className={channel.color}>
                                                    <ChannelIcon className="mr-1 h-3 w-3" />
                                                    {channel.label}
                                                </Badge>
                                            </div>

                                            {/* Stats row */}
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

                                        {/* Right: Actions */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            {(campaign.status === "active" || campaign.status === "paused") && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => toggleStatus(campaign)}
                                                    title={campaign.status === "active" ? "Pause" : "Resume"}
                                                >
                                                    {campaign.status === "active" ? (
                                                        <Pause className="h-4 w-4" />
                                                    ) : (
                                                        <Play className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link href={`/campaigns/${campaign.id}`}>
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
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
            )}
        </div>
    );
}
