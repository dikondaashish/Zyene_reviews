"use client";

import { Star, CheckCircle2, RefreshCw, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
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
import { postYelpReviewSync } from "./yelp-card-sync-api";

interface YelpIntegrationCardConnectedProps {
    platform: IntegrationPlatformSummary;
    businessId: string;
    reviewsUnavailable: boolean;
    mounted: boolean;
    yelpSyncedCount: number;
    isSyncing: boolean;
    setIsSyncing: (v: boolean) => void;
    router: { refresh: () => void };
    onDisconnect: () => void | Promise<void>;
}

export function YelpIntegrationCardConnected({
    platform,
    businessId,
    reviewsUnavailable,
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
                        <YelpCardIcon className="text-destructive size-6" />
                        <div>
                            <h3 className="ui-card-title">Yelp</h3>
                            <p className="text-xs text-muted-foreground">Rating and review count</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-chart-2/10 text-success border-chart-2/30 text-[10px]">
                        <CheckCircle2 className="mr-1 size-3" /> Connected
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted rounded-md p-2.5">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                            <Star className="size-3" /> {reviewsUnavailable ? "Yelp rating" : "Reviews synced"}
                        </div>
                        <p className="text-lg font-bold text-foreground">
                            {reviewsUnavailable
                                ? `${Number(platform.average_rating ?? 0).toFixed(1)}★ · ${platform.total_reviews ?? 0}`
                                : yelpSyncedCount}
                        </p>
                    </div>
                    <div className="bg-muted rounded-md p-2.5">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                            <Clock className="size-3" /> Last synced
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
                <p className="text-[10px] text-warning-foreground mt-3 flex items-center gap-1">
                    <AlertTriangle className="size-3" />
                    {reviewsUnavailable
                        ? "Your Yelp API plan doesn't include review text. Rating and review count still sync."
                        : "Yelp API returns 3 most recent reviews per sync"}
                </p>
            </CardContent>
            <CardFooter className="pt-0 flex items-center justify-between">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={async () => {
                        setIsSyncing(true);
                        const { ok } = await postYelpReviewSync(businessId);
                        if (ok) router.refresh();
                        setIsSyncing(false);
                    }}
                    disabled={isSyncing}
                >
                    <RefreshCw className={`mr-1.5 ${isSyncing ? "animate-spin" : ""} size-3`} />
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
