"use client";

import { useEffect } from "react";

type RouterRefresh = { refresh: () => void };

export function useGoogleCardForceSyncVisibility(
    isSyncBusy: boolean,
    isStalled: boolean,
    setShowForceSync: (v: boolean) => void
) {
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
    }, [isSyncBusy, isStalled, setShowForceSync]);
}

export function useGoogleCardRunningRefresh(remoteStatus: string | null, router: RouterRefresh) {
    useEffect(() => {
        if (remoteStatus === "running") {
            const interval = setInterval(() => {
                router.refresh();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [remoteStatus, router]);
}
