"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Loader2, Sparkles, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { useGoogleSyncRemoteState } from "@/hooks/use-google-sync-remote-state";

const CHECK_ITEMS = [
    { label: "Business profile created", delay: 0.1 },
    { label: "Review templates ready", delay: 0.3 },
] as const;

/**
 * Live Google import status, replacing a hardcoded "~1 hour" promise that production
 * data contradicted (real connect→first-review times ranged from under 2 minutes to
 * never). `useGoogleSyncRemoteState` polls /api/sync/google every 2.5s while the
 * platform is `running`, and `publishGoogleReviewSyncProgress` updates the rollups
 * mid-pagination, so `totalReviews` climbs during a multi-page import.
 */
function GoogleSyncStatusRow({ businessId }: { businessId: string }) {
    const { isSyncBusy, isStalled, remoteStatus, totalReviews } = useGoogleSyncRemoteState({
        businessId,
    });

    const importing = isSyncBusy && !isStalled;
    const failed = Boolean(remoteStatus?.startsWith("error")) || isStalled;

    const label = failed
        ? "Google connected — import didn't finish. Use Sync on the Reviews page."
        : importing
          ? totalReviews && totalReviews > 0
              ? `Importing Google reviews — ${totalReviews} so far`
              : "Importing your Google reviews"
          : totalReviews && totalReviews > 0
            ? `${totalReviews} Google reviews imported`
            : "Google Business connected";

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className={cn(
                "flex items-center gap-3 p-3.5 rounded-xl border",
                // A stalled import is a warning, not a hard error — the connection itself is
                // fine and Sync retries it. Matches the chart-4 callout convention.
                failed ? "bg-chart-4/12 border-chart-4/35" : "bg-chart-2/10 border-chart-2/25"
            )}
        >
            <div
                className={cn(
                    "rounded-lg flex items-center justify-center shrink-0 size-7",
                    failed ? "bg-chart-4/15" : "bg-chart-2/15"
                )}
            >
                {failed ? (
                    <AlertTriangle className="text-chart-4 size-4" />
                ) : importing ? (
                    <Loader2 className="text-chart-2 size-4 animate-spin" />
                ) : (
                    <CheckCircle2 className="text-chart-2 size-4" />
                )}
            </div>
            <span className="text-xs font-medium text-foreground">{label}</span>
        </motion.div>
    );
}

export function Step5FormCelebration({
    firstName,
    businessName,
    businessId,
    googleConnected,
}: {
    firstName: string;
    businessName: string;
    businessId: string;
    googleConnected: boolean;
}) {
    return (
        <>
            <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                className="inline-flex"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/15 rounded-full animate-ping opacity-40" />
                    <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center ring-1 ring-primary/20 size-16">
                        <Sparkles className="text-primary size-8" />
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
            >
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    You&apos;re all set, {firstName}!
                </h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    Your Zyene Reviews dashboard is ready for{" "}
                    <strong className="text-foreground">{businessName}</strong>.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-2.5 max-w-sm mx-auto text-left">
                {CHECK_ITEMS.map((item) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: item.delay, duration: 0.3 }}
                        className="flex items-center gap-3 p-3.5 bg-chart-2/10 rounded-xl border border-chart-2/25"
                    >
                        <div className="rounded-lg bg-chart-2/15 flex items-center justify-center shrink-0 size-7">
                            <CheckCircle2 className="text-chart-2 size-4" />
                        </div>
                        <span className="text-xs font-medium text-foreground">{item.label}</span>
                    </motion.div>
                ))}

                {googleConnected ? <GoogleSyncStatusRow businessId={businessId} /> : null}

                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="flex items-center gap-3 p-3.5 bg-primary/[0.04] rounded-xl border border-primary/10"
                >
                    <div className="rounded-lg bg-primary/10 flex items-center justify-center shrink-0 size-7">
                        <Star className="text-primary size-4" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Next:</strong> Send your first review request from the
                        dashboard.
                    </p>
                </motion.div>
            </div>
        </>
    );
}
