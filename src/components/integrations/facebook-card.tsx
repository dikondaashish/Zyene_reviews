"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
    Facebook,
    CheckCircle2,
    XCircle,
    ExternalLink,
    RefreshCw,
    Star,
    MessageSquare,
    Clock,
    AlertTriangle,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface FacebookCardProps {
    platform: any;
    businessId: string;
    businessName: string;
}

export function FacebookIntegrationCard({
    platform,
    businessId,
    businessName,
}: FacebookCardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [connecting, setConnecting] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [showDisconnect, setShowDisconnect] = useState(false);
    const [showPageSelect, setShowPageSelect] = useState(false);
    const [pages, setPages] = useState<any[]>([]);
    const [confirmingPage, setConfirmingPage] = useState<string | null>(null);

    const isConnected = platform?.sync_status === "active";
    const isError =
        platform?.sync_status?.startsWith("error") ||
        platform?.sync_status === "error_token_expired";

    // Check for page selection redirect from Facebook OAuth
    useEffect(() => {
        if (searchParams.get("fb_select_page") === "true") {
            fetchPagesFromCookie();
        }
        const fbError = searchParams.get("fb_error");
        if (fbError) {
            const messages: Record<string, string> = {
                denied: "Facebook login was denied",
                no_pages: "No Facebook pages found on your account",
                token_failed: "Failed to connect to Facebook. Please try again.",
                missing_params: "Connection failed. Please try again.",
                invalid_state: "Invalid connection state. Please try again.",
            };
            toast.error(messages[fbError] || "Facebook connection error");
        }
    }, [searchParams]);

    async function fetchPagesFromCookie() {
        try {
            const res = await fetch("/api/integrations/facebook/pages");
            if (!res.ok) throw new Error("Failed to fetch pages");
            const data = await res.json();
            setPages(data.pages || []);
            setShowPageSelect(true);
        } catch {
            // Cookie method: read directly from route that returns cookie data
            // Fallback: show a message
            toast.error(
                "Session expired. Please connect Facebook again."
            );
        }
    }

    function handleConnect() {
        setConnecting(true);
        // Redirect to Facebook OAuth
        window.location.href = `/api/integrations/facebook/connect?businessId=${businessId}`;
    }

    async function handleSelectPage(pageId: string) {
        setConfirmingPage(pageId);
        try {
            const res = await fetch("/api/integrations/facebook/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pageId }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to connect page");
            }

            toast.success("Facebook page connected successfully!");
            setShowPageSelect(false);
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setConfirmingPage(null);
        }
    }

    async function handleSync() {
        setSyncing(true);
        try {
            const res = await fetch("/api/cron/sync-reviews", {
                headers: { host: "localhost" },
            });
            if (!res.ok) throw new Error("Sync failed");
            toast.success("Facebook reviews synced!");
            router.refresh();
        } catch {
            toast.error("Sync failed. Please try again.");
        } finally {
            setSyncing(false);
        }
    }

    async function handleDisconnect() {
        try {
            const res = await fetch(
                `/api/businesses/${businessId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        disconnectPlatform: "facebook",
                    }),
                }
            );
            if (!res.ok) throw new Error("Disconnect failed");
            toast.success("Facebook disconnected");
            setShowDisconnect(false);
            router.refresh();
        } catch {
            toast.error("Failed to disconnect. Please try again.");
        }
    }

    const lastSynced = platform?.last_synced_at
        ? new Date(platform.last_synced_at).toLocaleString()
        : null;

    // ── Connected state ──
    if (isConnected) {
        return (
            <>
                <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Facebook className="h-5 w-5 text-blue-600" />
                                <CardTitle className="text-base">
                                    Facebook
                                </CardTitle>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Connected
                            </div>
                        </div>
                        <CardDescription>
                            Facebook page reviews &amp; recommendations
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Stats grid */}
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="rounded-lg bg-white dark:bg-gray-900 p-2 shadow-sm">
                                <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                                    <Star className="h-3.5 w-3.5 text-yellow-500" />
                                    {platform.average_rating?.toFixed(1) || "—"}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    Rating
                                </div>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-900 p-2 shadow-sm">
                                <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                                    <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                                    {platform.total_reviews || 0}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    Reviews
                                </div>
                            </div>
                            <div className="rounded-lg bg-white dark:bg-gray-900 p-2 shadow-sm">
                                <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                                    <Clock className="h-3.5 w-3.5 text-gray-500" />
                                    {lastSynced
                                        ? new Date(
                                            platform.last_synced_at
                                        ).toLocaleDateString()
                                        : "Never"}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    Last Sync
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={handleSync}
                                disabled={syncing}
                            >
                                {syncing ? (
                                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                )}
                                Sync Now
                            </Button>
                            {platform.external_url && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    asChild
                                >
                                    <a
                                        href={platform.external_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
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

                {/* Disconnect dialog */}
                <Dialog
                    open={showDisconnect}
                    onOpenChange={setShowDisconnect}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Disconnect Facebook?</DialogTitle>
                            <DialogDescription>
                                This will stop syncing Facebook reviews. Your
                                existing reviews will remain. You can reconnect
                                anytime.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowDisconnect(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDisconnect}
                            >
                                Disconnect
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    // ── Error state ──
    if (isError) {
        return (
            <Card className="border-red-200 dark:border-red-900">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Facebook className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-base">
                                Facebook
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                            <XCircle className="h-3.5 w-3.5" />
                            Error
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium text-red-700 dark:text-red-400">
                                {platform.sync_status ===
                                    "error_token_expired"
                                    ? "Access token expired"
                                    : "Sync error"}
                            </p>
                            <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-0.5">
                                Reconnect your Facebook page to resume syncing.
                            </p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        className="w-full mt-3"
                        onClick={handleConnect}
                        disabled={connecting}
                    >
                        {connecting ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                        ) : null}
                        Reconnect Facebook
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // ── Not connected state ──
    return (
        <>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Facebook className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-base">Facebook</CardTitle>
                    </div>
                    <CardDescription>
                        Track Facebook and Instagram page reviews &amp;
                        recommendations
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-xs text-blue-700 dark:text-blue-300">
                        <p className="font-medium mb-1">Facebook uses Recommendations</p>
                        <p>
                            Facebook pages use a thumbs up/down recommendation
                            system instead of star ratings. We map positive →
                            5★, negative → 1★.
                        </p>
                    </div>
                    <Button
                        className="w-full"
                        onClick={handleConnect}
                        disabled={connecting}
                    >
                        {connecting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Facebook className="h-4 w-4 mr-2" />
                        )}
                        Connect Facebook Page
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center">
                        Requires Facebook App Review for production use
                    </p>
                </CardContent>
            </Card>

            {/* Page selection dialog */}
            <Dialog open={showPageSelect} onOpenChange={setShowPageSelect}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Select a Facebook Page</DialogTitle>
                        <DialogDescription>
                            Choose the page you'd like to connect for review
                            monitoring.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {pages.map((page) => (
                            <button
                                key={page.pageId}
                                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent text-left transition-colors"
                                onClick={() => handleSelectPage(page.pageId)}
                                disabled={confirmingPage === page.pageId}
                            >
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                                    <Facebook className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">
                                        {page.pageName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {page.category}
                                    </p>
                                </div>
                                {confirmingPage === page.pageId ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : (
                                    <span className="text-xs text-blue-600 font-medium">
                                        Select
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
