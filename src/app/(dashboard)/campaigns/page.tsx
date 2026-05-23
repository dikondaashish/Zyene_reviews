"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Megaphone,
    Plus,
    Pause,
    Play,
    Trash2,
    Mail,
    MessageSquare,
    ArrowRight,
    Loader2,
    LayoutGrid,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CAMPAIGN_TEMPLATES } from "@/lib/campaigns/templates";
import { CampaignTemplateCard } from "@/components/campaigns/campaign-template-card";
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

const channelConfig: Record<string, { label: string; icon: LucideIcon; color: string }> = {
    sms: { label: "SMS", icon: MessageSquare, color: "bg-chart-1/15 text-chart-1 dark:bg-chart-1/20 dark:text-chart-1" },
    email: { label: "Email", icon: Mail, color: "bg-primary/10 text-primary" },
    both: { label: "SMS + Email", icon: MessageSquare, color: "bg-chart-4/18 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4" },
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
                                /* No-op: resend is handled by the banner flow. */
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
        <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Campaigns</h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Create and manage automated review request campaigns
                    </p>
                </div>
                <div className="grid w-full grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:w-auto sm:flex sm:flex-wrap sm:items-center sm:gap-3">
                    <Button variant="outline" asChild className="w-full sm:w-auto">
                        <Link href="/campaigns/templates" className="flex w-full items-center justify-center">
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            <span className="sm:hidden">Templates</span>
                            <span className="hidden sm:inline">Browse Templates</span>
                        </Link>
                    </Button>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/campaigns/new" className="flex w-full items-center justify-center">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Campaign
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList variant="line" className="mb-4 w-full min-w-0 justify-start border-b border-border">
                    <TabsTrigger value="all">All Campaigns</TabsTrigger>
                    <TabsTrigger value="templates">Template Library</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {/* Empty State */}
            {!loading && campaigns.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-6 bg-gradient-to-br from-background to-primary/10 rounded-3xl border border-primary/20 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-chart-1/15/10 dark:bg-chart-1/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
                        <div className="w-24 h-24 bg-gradient-to-tr from-primary to-primary/80 rounded-3xl flex items-center justify-center mb-8 rotate-3 transform transition-transform hover:rotate-0 duration-500">
                            <Megaphone className="h-12 w-12 text-primary-foreground" />
                        </div>
                        
                        <h3 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
                            Your first review is just one campaign away
                        </h3>
                        
                        <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                            Automate your review requests and watch your reputation grow. Set up a campaign in minutes and let Zyene do the heavy lifting.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
                             <Button size="lg" className="h-14 px-8 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]" asChild>
                                <Link href="/campaigns/new">
                                    <Plus className="mr-2 h-5 w-5" />
                                    Launch New Campaign
                                </Link>
                            </Button>
                        </div>

                        {/* Quick Start Templates */}
                        <div className="mt-16 w-full max-w-4xl">
                            <div className="flex items-center justify-center gap-2 mb-8">
                                <div className="h-px w-8 bg-primary/30"></div>
                                <span className="text-primary font-semibold uppercase tracking-wider text-xs">Or Quick Start with a Template</span>
                                <div className="h-px w-8 bg-primary/30"></div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                                {CAMPAIGN_TEMPLATES.map((template) => (
                                    <CampaignTemplateCard key={template.id} template={template} />
                                ))}
                            </div>
                        </div>

                        <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-chart-2/100 rounded-full"></div>
                                Automated SMS/Email
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                Smart Triggers
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
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
                                    <Card key={campaign.id} className="hover:border-primary/30 transition-colors">
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
                                                                    ? "bg-chart-2/15 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2"
                                                                    : campaign.status === "paused"
                                                                        ? "bg-chart-4/15 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4"
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
                </TabsContent>

                <TabsContent value="templates">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                        {CAMPAIGN_TEMPLATES.map((template) => (
                            <CampaignTemplateCard key={template.id} template={template} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
