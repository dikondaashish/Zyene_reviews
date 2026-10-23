"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock, LayoutDashboard, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useGoogleSyncRemoteState } from "@/hooks/use-google-sync-remote-state";

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
        ? "Google connected - import didn't finish. Use Sync on the Reviews page."
        : importing
          ? totalReviews && totalReviews > 0
              ? `Importing Google reviews - ${totalReviews} so far`
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
                // A stalled import is a warning, not a hard error - the connection itself is
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
                    <AlertTriangle className="text-warning-foreground size-4" />
                ) : importing ? (
                    <Loader2 className="text-success size-4 animate-spin" />
                ) : (
                    <CheckCircle2 className="text-success size-4" />
                )}
            </div>
            <span className="text-xs font-medium text-foreground">{label}</span>
        </motion.div>
    );
}

/** Plain expectations for the first days, so nothing that happens next is a surprise. */
function WhatHappensNext({ onOpenCalendar }: { onOpenCalendar: () => void }) {
    const items = [
        { icon: LayoutDashboard, text: "Your dashboard puts what needs you first, starting with unhappy reviews." },
        {
            icon: CalendarDays,
            text: "Everything Zyene sends or posts for you shows on your activity calendar.",
            action: { label: "Open calendar", onClick: onOpenCalendar },
        },
        { icon: Clock, text: "Reviews come in as customers answer your requests, so the first ones often take a few days." },
    ];
    return (
        <>
            {items.map((item, i) => (
                <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                    className="flex items-start gap-3 rounded-xl border border-border bg-background p-3.5"
                >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <item.icon className="size-4 text-primary" aria-hidden />
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">
                        {item.text}
                        {item.action ? (
                            <>
                                {" "}
                                <button type="button" onClick={item.action.onClick} className="font-semibold text-primary hover:underline">
                                    {item.action.label}
                                </button>
                            </>
                        ) : null}
                    </p>
                </motion.div>
            ))}
        </>
    );
}

export function Step5FormCelebration({
    firstName,
    businessName,
    businessId,
    googleConnected,
    onOpenCalendar,
}: {
    firstName: string;
    businessName: string;
    businessId: string;
    googleConnected: boolean;
    onOpenCalendar: () => void;
}) {
    return (
        <>
            <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                className="inline-flex"
            >
                <div className="relative bg-primary/10 rounded-full flex items-center justify-center size-16">
                    <CheckCircle2 className="text-primary size-8" aria-hidden="true" />
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
                <h1 className="ui-page-title text-foreground">You&apos;re all set, {firstName}!</h1>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    Zyene is ready for <strong className="text-foreground">{businessName}</strong>. Here&apos;s what happens now.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-2.5 max-w-sm mx-auto text-left">
                {googleConnected ? <GoogleSyncStatusRow businessId={businessId} /> : null}
                <WhatHappensNext onOpenCalendar={onOpenCalendar} />
            </div>
        </>
    );
}
