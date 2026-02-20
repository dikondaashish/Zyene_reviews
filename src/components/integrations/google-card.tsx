"use client";

import { useState } from "react";
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
import { disconnectGoogle } from "@/app/(dashboard)/integrations/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface GoogleCardProps {
    platform?: {
        id: string;
        external_id: string;
        last_synced_at: string | null;
        sync_status: string | null;
        total_reviews: number;
    } | null;
    businessName?: string | null;
}

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z"
                fill="#FBBC05"
            />
            <path
                d="M12 4.62c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
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

export function GoogleIntegrationCard({ platform, businessName }: GoogleCardProps) {
    const router = useRouter();
    const [isSyncing, setIsSyncing] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const isConnected = !!platform;
    const isError = platform?.sync_status?.startsWith("error");

    const supabase = createClient();

    const handleConnect = async () => {
        try {
            const rootDomain =
                process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
            
            const redirectTo = rootDomain.includes("localhost")
                ? `http://${rootDomain}/api/auth/callback?next=/dashboard/integrations`
                : `http://auth.${rootDomain}/api/auth/callback?next=/dashboard/integrations`;

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

    const handleSync = async () => {
        if (!platform) return;
        setIsSyncing(true);
        try {
            const res = await fetch("/api/sync/google", { method: "POST" });
            if (!res.ok) throw new Error("Sync failed");
            toast.success("Sync started successfully");
            router.refresh();
        } catch {
            toast.error("Failed to start sync");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDisconnect = async () => {
        if (!platform) return;
        setIsDisconnecting(true);
        try {
            await disconnectGoogle(platform.id);
            // Server action redirects to /onboarding on success
        } catch (err) {
            // redirect() from server actions throws NEXT_REDIRECT — don't catch it
            if (typeof err === "string" || (err && typeof err === "object" && "digest" in err)) {
                throw err;
            }
            toast.error("Failed to disconnect");
            setIsDisconnecting(false);
        }
    };

    // ── Error state ──
    if (isConnected && isError) {
        return (
            <Card className="border-red-200 dark:border-red-900/50 overflow-hidden">
                <div className="h-1 bg-red-500 w-full" />
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border shadow-sm">
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
                    <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3">
                        <p className="text-sm text-red-700 dark:text-red-300">
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
            <Card className="border-green-200/70 dark:border-green-900/50 overflow-hidden">
                <div className="h-1 bg-green-500 w-full" />
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border shadow-sm">
                                <GoogleIcon />
                            </div>
                            <div>
                                <p className="font-semibold text-base">Google Business Profile</p>
                                {businessName && (
                                    <p className="text-sm text-muted-foreground">{businessName}</p>
                                )}
                            </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 gap-1.5 border-0">
                            <CheckCircle2 className="h-3 w-3" />
                            Connected
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pb-3 space-y-3">
                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-muted/50 p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                                <Star className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium uppercase tracking-wide">Reviews Synced</span>
                            </div>
                            <p className="text-xl font-bold">{platform?.total_reviews || 0}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium uppercase tracking-wide">Last Synced</span>
                            </div>
                            <p className="text-sm font-semibold mt-1">
                                {platform?.last_synced_at ? timeAgo(platform.last_synced_at) : "Never"}
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2 pt-0">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button
                                className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors font-medium"
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
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Disconnect
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleSync}
                        disabled={isSyncing || isDisconnecting}
                    >
                        {isSyncing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Sync Now
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    // ── Not connected ──
    return (
        <Card className="overflow-hidden">
            <div className="h-1 bg-muted w-full" />
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border shadow-sm">
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
