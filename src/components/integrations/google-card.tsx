"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    CheckCircle2,
    AlertTriangle,
    RefreshCw,
    Star,
    Clock,
} from "lucide-react";
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
import { disconnectGoogle } from "@/app/(dashboard)/settings/integrations/_actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/db/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type {
    ApiErrorResponse,
    GoogleLocationSelectorResponse,
} from "@/types/components";
import { useGoogleSyncRemoteState } from "@/hooks/use-google-sync-remote-state";

interface GoogleCardProps {
    platform?: {
        id: string;
        external_id: string;
        last_synced_at: string | null;
        google_location_id?: string | null;
        google_account_id?: string | null;
        google_performance_synced_at?: string | null;
        sync_status: string | null;
        total_reviews: number;
        average_rating?: number | null;
    } | null;
    businessId: string;
    businessName?: string | null;
    /** All Google rows in `reviews` including hidden (`is_visible = false`); optional diagnostics only. */
    dbGoogleSyncedRowCount?: number;
    /** Visible Google rows (`is_visible = true`) — primary count for UI and polling seed. */
    dbVisibleGoogleReviewCount?: number;
    dbVisibleGoogleAverageRating?: number | null;
}

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="var(--brand-google)"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="var(--google-logo-green)"
            />
            <path
                d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z"
                fill="var(--google-logo-yellow)"
            />
            <path
                d="M12 4.62c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="var(--google-logo-red)"
            />
        </svg>
    );
}

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function GoogleIntegrationCard({
    platform,
    businessId,
    businessName,
    dbGoogleSyncedRowCount,
    dbVisibleGoogleReviewCount,
    dbVisibleGoogleAverageRating,
}: GoogleCardProps) {
    const router = useRouter();
    const [isPosting, setIsPosting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [showForceSync, setShowForceSync] = useState(false);
    const { remoteStatus, isSyncBusy, isStalled, markManualSyncStarted, lastSyncedAt, totalReviews } =
        useGoogleSyncRemoteState({
            businessId,
            initialSyncStatus: platform?.sync_status ?? null,
            initialLastSyncedAt: platform?.last_synced_at ?? null,
            initialTotalReviews:
                typeof dbVisibleGoogleReviewCount === "number"
                    ? dbVisibleGoogleReviewCount
                    : dbGoogleSyncedRowCount !== undefined
                      ? dbGoogleSyncedRowCount
                      : null,
            initialAverageRating:
                dbVisibleGoogleAverageRating != null && !Number.isNaN(Number(dbVisibleGoogleAverageRating))
                    ? Number(dbVisibleGoogleAverageRating)
                    : platform?.average_rating != null && !Number.isNaN(Number(platform.average_rating))
                      ? Number(platform.average_rating)
                      : null,
            onSyncSettled: () => router.refresh(),
        });
    const syncButtonBusy = isPosting || isSyncBusy;
    const [mounted, setMounted] = useState(false);
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);
    const [accounts, setAccounts] = useState<Array<{ resourceName: string; accountName: string; locations: Array<{ name: string; title: string; storeCode?: string | null }> }>>([]);
    const [selectedAccount, setSelectedAccount] = useState<string>("");
    const [selectedLocation, setSelectedLocation] = useState<string>("");

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isStalled) {
            setShowForceSync(true);
            return;
        }
        if (!isSyncBusy) {
            setShowForceSync(false);
            return;
        }
        const timer = setTimeout(() => setShowForceSync(true), 60_000);
        return () => clearTimeout(timer);
    }, [isSyncBusy, isStalled]);

    const isConnected = !!platform;
    const isError = platform?.sync_status?.startsWith("error");
    const needsLocation = isConnected && !platform?.google_location_id;

    const displayReviewCount =
        typeof dbVisibleGoogleReviewCount === "number"
            ? dbVisibleGoogleReviewCount
            : dbGoogleSyncedRowCount !== undefined
              ? dbGoogleSyncedRowCount
              : (totalReviews ?? 0);
    const displayLastSyncedAt = lastSyncedAt ?? platform?.last_synced_at ?? null;

    const supabase = createClient();

    const handleConnect = async () => {
        try {
            const rootDomain =
                process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
            const redirectTo = rootDomain.includes("localhost")
                ? `http://${rootDomain}/api/auth/callback?next=/settings/integrations&biz=${encodeURIComponent(businessId)}`
                : `https://auth.${rootDomain}/api/auth/callback?next=/settings/integrations&biz=${encodeURIComponent(businessId)}`;

            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    scopes:
                        "openid email profile https://www.googleapis.com/auth/business.manage",
                    redirectTo,
                    queryParams: {
                        access_type: "offline",
                        prompt: "consent",
                    },
                },
            });
            if (error) throw error;
        } catch {
            toast.error("Failed to initiate Google connection");
        }
    };

    const loadLocations = async () => {
        setIsLoadingLocations(true);
        try {
            const res = await fetch(`/api/google/location-selector?businessId=${encodeURIComponent(businessId)}`);
            const data = (await res.json().catch(() => ({}))) as GoogleLocationSelectorResponse;
            if (!res.ok) {
                const msg = data.error || "Failed to load Google locations";
                toast.error("Failed to load Google locations", { description: msg });
                if (res.status === 401 && /reconnect/i.test(String(msg))) {
                    setIsPickingLocation(false);
                    router.refresh();
                }
                return;
            }
            const accs = data.data?.accounts || data.accounts || [];
            setAccounts(accs);
            if (accs.length > 0) {
                setSelectedAccount(accs[0].resourceName);
                const firstLoc = accs[0].locations?.[0]?.name;
                if (firstLoc) setSelectedLocation(firstLoc);
            }
        } finally {
            setIsLoadingLocations(false);
        }
    };

    const saveLocation = async () => {
        if (!selectedAccount || !selectedLocation) return;
        try {
            const res = await fetch("/api/google/location-selector", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessId,
                    accountName: selectedAccount,
                    locationName: selectedLocation,
                }),
            });
            const data = (await res.json().catch(() => ({}))) as ApiErrorResponse;
            if (!res.ok) {
                toast.error("Failed to save location", { description: data.error });
                return;
            }
            toast.success("Google location linked");
            setIsPickingLocation(false);
            router.refresh();
        } catch (e: unknown) {
            toast.error("Failed to save location", { description: e instanceof Error ? e.message : undefined });
        }
    };

    const handleSync = async (force = false) => {
        if (!platform) return;
        setIsPosting(true);
        try {
            const res = await fetch("/api/sync/google", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId, force })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const msg = (data as { error?: string }).error || "Sync failed";
                const details = (data as { details?: string }).details;
                const activationUrl = (data as { activationUrl?: string }).activationUrl;
                
                // Special handling for Conflict (409)
                if (res.status === 409) {
                    toast.error("Sync is already running", {
                        description: "If it's been running for a long time, you can try to Force Sync.",
                        action: {
                            label: "Force Sync",
                            onClick: () => handleSync(true)
                        }
                    });
                    return;
                }

                const description = [details, activationUrl].filter(Boolean).join("\n\n");
                toast.error(msg, { description: description || undefined, duration: 12_000 });
                return;
            }
            markManualSyncStarted();
            toast.success("Background sync started");
            router.refresh();
        } catch (err: unknown) {
            console.error("[Google Sync] Error:", err);
            toast.error(err instanceof Error ? err.message : "Failed to start sync");
        } finally {
            setIsPosting(false);
        }
    };

    useEffect(() => {
        if (remoteStatus === "running") {
            const interval = setInterval(() => {
                router.refresh();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [remoteStatus, router]);

    const handleDisconnect = async () => {
        if (!platform) return;
        setIsDisconnecting(true);
        try {
            await disconnectGoogle(platform.id);
        } catch (err: unknown) {
            const digest =
                err && typeof err === "object" && "digest" in err
                    ? String((err as { digest?: string }).digest)
                    : "";
            if (digest.startsWith("NEXT_REDIRECT")) {
                return;
            }
            console.error("[Google] disconnect:", err);
            toast.error(err instanceof Error ? err.message : "Failed to disconnect");
        } finally {
            setIsDisconnecting(false);
        }
    };

    // ── Error state ──
    if (isConnected && isError) {
        return (
            <Card className="border-destructive/30 dark:border-destructive/30 overflow-hidden">
                <div className="h-1 bg-destructive/100 w-full" />
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card border border-border">
                                <GoogleIcon />
                            </div>
                            <div>
                                <p className="font-semibold text-base">Google Business Profile</p>
                                <p className="text-sm text-muted-foreground">Sync reviews and respond directly</p>
                            </div>
                        </div>
                        <Badge variant="destructive" className="gap-1.5">
                            <AlertTriangle className="h-3 w-3" />
                            Connection Error
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pb-3">
                    <div className="rounded-lg bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 dark:border-destructive/30 p-3">
                        <p className="text-sm text-destructive dark:text-destructive">
                            Your Google connection encountered an error. This usually happens when permissions expire. Please reconnect to resume syncing.
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleConnect}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reconnect Google Account
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    // ── Connected state ──
    if (isConnected) {
        return (
            <Card className="border-chart-2/30/70 dark:border-chart-2/30 overflow-hidden">
                <div className="h-1 bg-chart-2/100 w-full" />
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card border border-border">
                                <GoogleIcon />
                            </div>
                            <div>
                                <p className="font-semibold text-base">Google Business Profile</p>
                                {businessName && (
                                    <p className="text-sm text-muted-foreground">{businessName}</p>
                                )}
                            </div>
                        </div>
                        <Badge className="bg-chart-2/15 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2 gap-1.5 border-0">
                            <CheckCircle2 className="h-3 w-3" />
                            Connected
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pb-3 space-y-3">
                    {needsLocation && (
                        <div className="rounded-lg border border-chart-4/35 bg-chart-4/12 p-3 text-sm text-chart-4">
                            <p className="font-medium">Action required: choose your Google location</p>
                            <p className="text-xs mt-1 text-chart-4">
                                This business is connected to Google, but no GBP location has been selected yet.
                            </p>
                            <div className="mt-2">
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={async () => {
                                            setIsPickingLocation(true);
                                            await loadLocations();
                                        }}
                                    >
                                        Choose location
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleConnect}>
                                        Reconnect Google
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-muted/50 p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                                <Star className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium uppercase tracking-wide">Reviews Synced</span>
                            </div>
                            <p className="text-xl font-bold">{displayReviewCount}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium uppercase tracking-wide">Last Synced</span>
                            </div>
                            <p className="text-sm font-semibold mt-1">
                                {!mounted ? "..." : displayLastSyncedAt ? timeAgo(displayLastSyncedAt) : "Never"}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                        Listing performance (views, calls, directions, site clicks) and monthly search keywords sync with Sync or the daily cron.
                    </p>
                    {isSyncBusy && showForceSync && (
                        <div className="rounded-lg border border-chart-4/35 bg-chart-4/12 p-3 text-sm text-chart-4">
                            <p className="font-medium">
                                {isStalled ? "Sync appears stuck" : "Sync taking longer than usual"}
                            </p>
                            <p className="text-xs mt-1 text-chart-4/90">
                                {isStalled
                                    ? "The background job may not have started or finished. Force Sync clears the lock and retries."
                                    : "Reviews may still be importing. If this persists, use Force Sync."}
                            </p>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="mt-2"
                                disabled={syncButtonBusy}
                                onClick={() => handleSync(true)}
                            >
                                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                Force Sync
                            </Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between gap-2 pt-0">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button
                                className="text-xs text-destructive hover:text-destructive dark:text-destructive dark:hover:text-destructive transition-colors font-medium"
                                disabled={isDisconnecting}
                            >
                                {isDisconnecting ? "Disconnecting…" : "Disconnect"}
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Disconnect Google?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will stop automatic review syncing. Your existing reviews will remain in Zyene but no new reviews will be imported.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDisconnect}
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                    Disconnect
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSync()}
                        disabled={syncButtonBusy || isDisconnecting || needsLocation}
                    >
                        {syncButtonBusy ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Sync Now
                    </Button>
                </CardFooter>

                <Dialog open={isPickingLocation} onOpenChange={setIsPickingLocation}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Select Google Business Profile location</DialogTitle>
                            <DialogDescription>
                                Choose the GBP location that matches this Zyene business. This prevents mixing reviews between businesses.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="text-sm font-medium">Account</div>
                                <Select
                                    value={selectedAccount}
                                    onValueChange={(v) => {
                                        setSelectedAccount(v);
                                        const acc = accounts.find((a) => a.resourceName === v);
                                        const firstLoc = acc?.locations?.[0]?.name;
                                        if (firstLoc) setSelectedLocation(firstLoc);
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map((a) => (
                                            <SelectItem key={a.resourceName} value={a.resourceName}>
                                                {a.accountName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium">Location</div>
                                <Select value={selectedLocation} onValueChange={setSelectedLocation} disabled={!selectedAccount || isLoadingLocations}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={isLoadingLocations ? "Loading…" : "Select location"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(accounts.find((a) => a.resourceName === selectedAccount)?.locations || []).map((l) => (
                                            <SelectItem key={l.name} value={l.name}>
                                                {l.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPickingLocation(false)}>
                                Cancel
                            </Button>
                            <Button onClick={saveLocation} disabled={!selectedAccount || !selectedLocation}>
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Card>
        );
    }

    // ── Not connected ──
    return (
        <Card className="overflow-hidden">
            <div className="h-1 bg-muted w-full" />
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card border border-border">
                        <GoogleIcon />
                    </div>
                    <div>
                        <p className="font-semibold text-base">Google Business Profile</p>
                        <p className="text-sm text-muted-foreground">
                            Sync your Google reviews and reply from Zyene
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground">
                    Connect your Google Business Profile to automatically import reviews, track ratings, and respond —
                    all from your Zyene dashboard.
                </p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleConnect}>
                    <GoogleIcon />
                    <span className="ml-2">Connect Google Business Profile</span>
                </Button>
            </CardFooter>
        </Card>
    );
}
