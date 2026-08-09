"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGoogleSyncRemoteState } from "@/hooks/use-google-sync-remote-state";
import { useGoogleCardForceSyncVisibility, useGoogleCardRunningRefresh } from "@/components/integrations/use-google-integration-card-effects";
import {
    startGoogleOAuthConnect,
    startGoogleSearchConsoleConnect,
} from "@/components/integrations/google-card-oauth-connect";
import { postGoogleReviewSync } from "@/components/integrations/google-card-sync-api";
import type { GoogleCardProps } from "@/components/integrations/google-card-types";
import { useGoogleCardLocationPicker } from "@/components/integrations/use-google-card-location-picker";
import { runGoogleCardDisconnect } from "@/components/integrations/google-card-disconnect";

export function useGoogleIntegrationCard({
    platform,
    businessId,
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
    const {
        isLoadingLocations,
        accounts,
        selectedAccount,
        setSelectedAccount,
        selectedLocation,
        setSelectedLocation,
        loadLocations: loadLocationAccounts,
        saveLocation: savePickedLocation,
    } = useGoogleCardLocationPicker(businessId);

    useEffect(() => {
        setMounted(true);
    }, []);

    useGoogleCardForceSyncVisibility(isSyncBusy, isStalled, setShowForceSync);

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

    const handleConnect = () => void startGoogleOAuthConnect(businessId);
    const handleConnectSearchConsole = () => void startGoogleSearchConsoleConnect(businessId);

    const loadLocations = async () => {
        await loadLocationAccounts(() => {
            setIsPickingLocation(false);
            router.refresh();
        });
    };

    const saveLocation = () => savePickedLocation(setIsPickingLocation);

    const handleSync = async (force = false) => {
        if (!platform) return;
        setIsPosting(true);
        try {
            const result = await postGoogleReviewSync(businessId, force, () => void handleSync(true));
            if (result.ok) {
                markManualSyncStarted();
                toast.success("Background sync started");
                router.refresh();
            }
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to start sync");
        } finally {
            setIsPosting(false);
        }
    };

    useGoogleCardRunningRefresh(remoteStatus, router);

    const handleDisconnect = async () => {
        if (!platform) return;
        setIsDisconnecting(true);
        try {
            await runGoogleCardDisconnect(platform.id);
        } finally {
            setIsDisconnecting(false);
        }
    };

    return {
        platform,
        isPosting,
        isDisconnecting,
        showForceSync,
        syncButtonBusy,
        mounted,
        isPickingLocation,
        setIsPickingLocation,
        isLoadingLocations,
        accounts,
        selectedAccount,
        setSelectedAccount,
        selectedLocation,
        setSelectedLocation,
        isConnected,
        isError,
        needsLocation,
        displayReviewCount,
        displayLastSyncedAt,
        isSyncBusy,
        isStalled,
        handleConnect,
        handleConnectSearchConsole,
        loadLocations,
        saveLocation,
        handleSync,
        handleDisconnect,
    };
}
