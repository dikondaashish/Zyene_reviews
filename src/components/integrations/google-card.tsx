
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, Trash2, ExternalLink } from "lucide-react";
import { disconnectGoogle } from "@/app/(dashboard)/integrations/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface GoogleCardProps {
    platform?: {
        id: string;
        external_id: string; // "accounts/..." or location name
        last_synced_at: string | null;
        sync_status: string | null; // 'active', 'error', etc.
        total_reviews: number;
    } | null;
}

export function GoogleIntegrationCard({ platform }: GoogleCardProps) {
    const router = useRouter();
    const [isSyncing, setIsSyncing] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const isConnected = !!platform;
    const isError = platform?.sync_status?.startsWith("error");

    const handleConnect = () => {
        // Redirect to Google OAuth
        window.location.href = "/api/integrations/google/auth";
    };

    const handleSync = async () => {
        if (!platform) return;
        setIsSyncing(true);
        try {
            const res = await fetch("/api/sync/google", { method: "POST" });
            if (!res.ok) throw new Error("Sync failed");
            toast.success("Sync started successfully");
            router.refresh();
        } catch (error) {
            toast.error("Failed to start sync");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDisconnect = async () => {
        if (!platform || !confirm("Are you sure you want to disconnect Google? This will stop review syncing.")) return;
        setIsDisconnecting(true);
        try {
            await disconnectGoogle(platform.id);
            toast.success("Disconnected Google Business Profile");
        } catch (error) {
            toast.error("Failed to disconnect");
        } finally {
            setIsDisconnecting(false);
        }
    };

    return (
        <Card className={isConnected ? "border-green-200 bg-green-50/10 dark:border-green-900/50" : ""}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Google Logo Placeholder - use text or an SVG if available */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border shadow-sm">
                            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" /><path d="M12 4.62c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        </div>
                        <div>
                            <CardTitle className="text-lg">Google Business Profile</CardTitle>
                            <CardDescription>Sync reviews and respond directly</CardDescription>
                        </div>
                    </div>
                    {isConnected && (
                        <Badge variant={isError ? "destructive" : "default"} className={!isError ? "bg-green-600 hover:bg-green-700" : ""}>
                            {isError ? "Error" : "Connected"}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isConnected ? (
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Location ID</span>
                            <span className="font-mono text-xs">{platform?.external_id?.slice(0, 15)}...</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Synced</span>
                            <span>{platform?.last_synced_at ? new Date(platform.last_synced_at).toLocaleString() : "Never"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Reviews</span>
                            <span>{platform?.total_reviews || 0}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Connect your Google Business Profile to automatically import reviews and manage them from your dashboard.
                    </p>
                )}
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
                {isConnected ? (
                    <>
                        <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={isDisconnecting || isSyncing}>
                            {isDisconnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Disconnect
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleSync} disabled={isSyncing || isDisconnecting}>
                            {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Sync Now
                        </Button>
                    </>
                ) : (
                    <Button className="w-full" onClick={handleConnect}>
                        Connect Google Account
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
