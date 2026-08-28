"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { FacebookPageOption } from "@/types/components";
import { FACEBOOK_OAUTH_ERROR_MESSAGES } from "@/components/integrations/facebook-card-oauth-messages";
import {
    disconnectFacebookIntegration,
    runFacebookReviewsSync,
} from "@/components/integrations/facebook-card-client-actions";
import {
    fetchFacebookPagesForSelection,
    toastFacebookPagesSessionExpired,
} from "@/components/integrations/facebook-card-pages-api";
import type { FacebookCardProps } from "@/components/integrations/facebook-card-types";

export function useFacebookIntegrationCard({
    platform,
    businessId,
    businessName,
    dbFacebookSyncedRowCount,
    dbVisibleFacebookReviewCount,
    dbVisibleFacebookAverageRating,
}: FacebookCardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [connecting, setConnecting] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [showDisconnect, setShowDisconnect] = useState(false);
    const [showPageSelect, setShowPageSelect] = useState(false);
    const [pages, setPages] = useState<FacebookPageOption[]>([]);
    const [confirmingPage, setConfirmingPage] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isConnected = platform?.sync_status === "active";
    const fbVisibleCount = dbVisibleFacebookReviewCount ?? 0;
    const fbSyncedCount =
        typeof dbVisibleFacebookReviewCount === "number"
            ? dbVisibleFacebookReviewCount
            : dbFacebookSyncedRowCount !== undefined
              ? dbFacebookSyncedRowCount
              : fbVisibleCount;
    const fbRatingDisplay =
        fbVisibleCount > 0 && dbVisibleFacebookAverageRating != null && !Number.isNaN(dbVisibleFacebookAverageRating)
            ? dbVisibleFacebookAverageRating.toFixed(1)
            : "—";
    const isError =
        platform?.sync_status?.startsWith("error") || platform?.sync_status === "error_token_expired";

    useEffect(() => {
        if (searchParams.get("fb_select_page") === "true") {
            void fetchPagesFromCookie();
        }
        const fbError = searchParams.get("fb_error");
        if (fbError) {
            toast.error(FACEBOOK_OAUTH_ERROR_MESSAGES[fbError] || "Facebook connection error");
        }
    }, [searchParams]);

    async function fetchPagesFromCookie() {
        try {
            const nextPages = await fetchFacebookPagesForSelection();
            setPages(nextPages);
            setShowPageSelect(true);
        } catch {
            toastFacebookPagesSessionExpired();
        }
    }

    function handleConnect() {
        setConnecting(true);
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
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "An unexpected error occurred";
            toast.error(message);
        } finally {
            setConfirmingPage(null);
        }
    }

    async function handleSync() {
        setSyncing(true);
        try {
            await runFacebookReviewsSync(router, businessId);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Sync failed. Please try again.");
        } finally {
            setSyncing(false);
        }
    }

    async function handleDisconnect() {
        try {
            await disconnectFacebookIntegration(businessId, router);
            setShowDisconnect(false);
        } catch {
            toast.error("Failed to disconnect. Please try again.");
        }
    }

    return {
        platform,
        businessName,
        connecting,
        syncing,
        showDisconnect,
        setShowDisconnect,
        showPageSelect,
        setShowPageSelect,
        pages,
        confirmingPage,
        mounted,
        isConnected,
        fbSyncedCount,
        fbRatingDisplay,
        isError,
        handleConnect,
        handleSelectPage,
        handleSync,
        handleDisconnect,
    };
}
