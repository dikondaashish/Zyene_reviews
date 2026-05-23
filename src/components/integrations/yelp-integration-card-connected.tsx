"use client";

import { Star, CheckCircle2, RefreshCw, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
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
import type { IntegrationPlatformSummary } from "@/types/components";
import { YelpCardIcon } from "./yelp-card-icon";

interface YelpIntegrationCardConnectedProps {
    platform: IntegrationPlatformSummary;
    mounted: boolean;
    yelpSyncedCount: number;
    isSyncing: boolean;
    setIsSyncing: (v: boolean) => void;
    router: { refresh: () => void };
    onDisconnect: () => void | Promise<void>;
}

export function YelpIntegrationCardConnected({
    platform,
    mounted,
    yelpSyncedCount,
    isSyncing,
    setIsSyncing,
    router,
    onDisconnect,
}: YelpIntegrationCardConnectedProps) {
    return (
        <Card className="border border-border bg-card">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <YelpCardIcon className="h-6 w-6 text-destructive" />
                        <div>
                            <h3 className="font-semibold text-sm">Yelp</h3>
                            <p className="text-xs text-muted-foreground">Business reviews</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/30 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted rounded-md p-2.5">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                            <Star className="w-3 h-3" /> Reviews synced
                        </div>
                        <p className="text-lg font-bold text-foreground">{yelpSyncedCount}</p>
                    </div>
                    <div className="bg-muted rounded-md p-2.5">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                            <Clock className="w-3 h-3" /> Last synced
                        </div>
                        <p className="text-xs font-medium text-foreground mt-1">
                            {!mounted
                                ? "..."
                                : platform.last_synced_at
                                  ? new Date(platform.last_synced_at as string).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })
                                  : "Never"}
                        </p>
                    </div>
                </div>
                <p className="text-[10px] text-chart-4 mt-3 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Yelp API returns 3 most recent reviews per sync
                </p>
            </CardContent>
            <CardFooter className="pt-0 flex items-center justify-between">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={async () => {
                        setIsSyncing(true);
                        try {
                            const res = await fetch("/api/cron/sync-reviews");
                            const data = await res.json().catch(() => ({}));

                            if (!res.ok) {
                                const msg = data.error || "Sync failed";
                                const details = data.details;
                                toast.error(msg, { description: details });
                                return;
                            }

                            toast.success("Sync triggered");
                            router.refresh();
                        } catch {
                            toast.error("Sync failed");
                        } finally {
                            setIsSyncing(false);
                        }
                    }}
                    disabled={isSyncing}
                >
                    <RefreshCw className={`w-3 h-3 mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
                    Sync Now
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button type="button" className="text-xs text-destructive hover:text-destructive hover:underline">
                            Disconnect
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Disconnect Yelp?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will stop syncing reviews from Yelp. Your existing reviews will be kept.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={onDisconnect}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                Disconnect
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
}
