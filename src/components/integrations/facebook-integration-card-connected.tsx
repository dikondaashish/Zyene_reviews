"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, ExternalLink, RefreshCw, Star, MessageSquare, Clock, Loader2 } from "lucide-react";
import { FacebookBrandIcon } from "@/components/integrations/facebook-brand-icon";
import type { IntegrationPlatformSummary } from "@/types/components";

export function FacebookIntegrationCardConnected({
    platform,
    mounted,
    fbRatingDisplay,
    fbSyncedCount,
    syncing,
    showDisconnect,
    setShowDisconnect,
    handleSync,
    handleDisconnect,
}: {
    platform: IntegrationPlatformSummary;
    mounted: boolean;
    fbRatingDisplay: string;
    fbSyncedCount: number;
    syncing: boolean;
    showDisconnect: boolean;
    setShowDisconnect: (v: boolean) => void;
    handleSync: () => void | Promise<void>;
    handleDisconnect: () => void | Promise<void>;
}) {
    return (
        <>
            <Card className="border-primary/20 bg-primary/10 dark:border-primary/30 dark:bg-primary/15">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FacebookBrandIcon className="h-5 w-5 shrink-0" aria-hidden />
                            <CardTitle className="text-base">Facebook</CardTitle>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-chart-2">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Connected
                        </div>
                    </div>
                    <CardDescription>Facebook page reviews &amp; recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center sm:gap-3">
                        <div className="rounded-lg bg-card p-2 border border-border">
                            <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                                <Star className="h-3.5 w-3.5 text-chart-4" />
                                {fbRatingDisplay}
                            </div>
                            <div className="text-[10px] text-muted-foreground">Rating</div>
                        </div>
                        <div className="rounded-lg bg-card p-2 border border-border">
                            <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                {fbSyncedCount}
                            </div>
                            <div className="text-[10px] text-muted-foreground">Reviews</div>
                        </div>
                        <div className="rounded-lg bg-card p-2 border border-border">
                            <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                {!mounted
                                    ? "..."
                                    : platform?.last_synced_at
                                      ? new Date(platform.last_synced_at as string).toLocaleDateString()
                                      : "Never"}
                            </div>
                            <div className="text-[10px] text-muted-foreground">Last Sync</div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={handleSync} disabled={syncing}>
                            {syncing ? (
                                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                            ) : (
                                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                            )}
                            Sync Now
                        </Button>
                        {platform.external_url && (
                            <Button size="sm" variant="outline" asChild>
                                <a href={platform.external_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            </Button>
                        )}
                    </div>

                    <Button
                        size="sm"
                        variant="ghost"
                        className="w-full text-xs text-muted-foreground"
                        onClick={() => setShowDisconnect(true)}
                    >
                        Disconnect
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={showDisconnect} onOpenChange={setShowDisconnect}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Disconnect Facebook?</DialogTitle>
                        <DialogDescription>
                            This will stop syncing Facebook reviews. Your existing reviews will remain. You can
                            reconnect anytime.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDisconnect(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDisconnect}>
                            Disconnect
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
