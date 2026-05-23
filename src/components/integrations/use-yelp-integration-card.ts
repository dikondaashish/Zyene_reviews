"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { YelpBusinessResult, YelpCardProps } from "./yelp-card-types";

export function useYelpIntegrationCard({
    platform,
    businessId,
    businessName,
    dbYelpSyncedRowCount,
    dbVisibleYelpReviewCount,
}: YelpCardProps) {
    const router = useRouter();
    const [showConnect, setShowConnect] = useState(false);
    const [searchName, setSearchName] = useState(businessName || "");
    const [searchLocation, setSearchLocation] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<YelpBusinessResult[]>([]);
    const [isConfirming, setIsConfirming] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const isConnected = platform && platform.sync_status === "active";
    const yelpVisibleCount = dbVisibleYelpReviewCount ?? 0;
    const yelpSyncedCount =
        typeof dbVisibleYelpReviewCount === "number"
            ? dbVisibleYelpReviewCount
            : dbYelpSyncedRowCount !== undefined
              ? dbYelpSyncedRowCount
              : yelpVisibleCount;
    const hasError = platform && platform.sync_status?.startsWith("error");

    const handleSearch = async () => {
        if (!searchName.trim() || !searchLocation.trim()) {
            toast.error("Please enter both business name and location");
            return;
        }

        setIsSearching(true);
        setSearchResults([]);

        try {
            const res = await fetch("/api/integrations/yelp/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessName: searchName,
                    location: searchLocation,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Search failed");

            setSearchResults(data.businesses || []);
            if (data.businesses?.length === 0) {
                toast.info("No businesses found. Try different search terms.");
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(message);
        } finally {
            setIsSearching(false);
        }
    };

    const handleConfirm = async (yelpBiz: YelpBusinessResult) => {
        setIsConfirming(yelpBiz.yelpId);

        try {
            const res = await fetch("/api/integrations/yelp/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    yelpBusinessId: yelpBiz.yelpId,
                    businessId: businessId,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Connection failed");

            toast.success(`Connected to ${yelpBiz.name} on Yelp!`);
            setShowConnect(false);
            setSearchResults([]);
            router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(message);
        } finally {
            setIsConfirming(null);
        }
    };

    const handleDisconnect = async () => {
        try {
            await fetch(`/api/businesses/${businessId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    disconnect_platform: "yelp",
                }),
            });

            toast.success("Yelp disconnected");
            router.refresh();
        } catch {
            toast.error("Failed to disconnect");
        }
    };

    return {
        router,
        showConnect,
        setShowConnect,
        searchName,
        setSearchName,
        searchLocation,
        setSearchLocation,
        isSearching,
        searchResults,
        setSearchResults,
        isConfirming,
        isSyncing,
        setIsSyncing,
        mounted,
        isConnected,
        yelpSyncedCount,
        hasError,
        platform,
        businessId,
        handleSearch,
        handleConfirm,
        handleDisconnect,
    };
}
