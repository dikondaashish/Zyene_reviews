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
                const errorData = await res.json();
                if (errorData.code === "EMAIL_NOT_VERIFIED") {
                    toast.error("Email verification required", {
                        description: "You must verify your email before activating campaigns.",
                        action: {
                            label: "Resend Email",
                            onClick: () => {
                                // This is handled by the top banner, but we could trigger it here too
                                console.log("Resend verification requested");
                            }
                        }
                    });
                } else {
                    toast.error(errorData.error || "Failed to update campaign");
                }
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
                <div className="flex flex-col items-center justify-center py-20 px-6 bg-gradient-to-br from-white to-orange-50/30 rounded-3xl border border-orange-100 shadow-sm relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
                        <div className="w-24 h-24 bg-gradient-to-tr from-orange-500 to-orange-400 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-orange-200 rotate-3 transform transition-transform hover:rotate-0 duration-500">
                            <Megaphone className="h-12 w-12 text-white" />
                        </div>
                        
                        <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                            Your first review is just one campaign away
                        </h3>
                        
                        <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                            Automate your review requests and watch your reputation grow. Set up a campaign in minutes and let Zyene do the heavy lifting.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Button size="lg" className="h-14 px-8 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl shadow-lg shadow-orange-200 transition-all hover:scale-[1.02] active:scale-[0.98]" asChild>
                                <Link href="/campaigns/new">
                                    <Plus className="mr-2 h-5 w-5" />
                                    Launch Your First Campaign
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-2xl transition-all" asChild>
                                <Link href="/analytics">
                                    Browse Sample Reports
                                </Link>
                            </Button>
                        </div>

                        <div className="mt-12 flex items-center gap-8 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                Automated SMS/Email
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                Smart Triggers
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                Real-time Tracking
                            </div>
                        </div>
                    </div>
                </div>
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
