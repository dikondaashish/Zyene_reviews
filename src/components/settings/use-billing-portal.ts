"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useBillingPortal(canManageBilling: boolean, noBillingPermissionMessage: string) {
    const [loadingPortal, setLoadingPortal] = useState(false);

    const handleManageSubscription = useCallback(async () => {
        if (!canManageBilling) {
            toast.error(noBillingPermissionMessage);
            return;
        }
        setLoadingPortal(true);
        try {
            const res = await fetch("/api/billing/portal", { method: "POST", credentials: "include" });
            const data = await res.json();
            if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Failed to open portal");
            if (data.url) window.location.href = data.url;
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to open billing portal");
        } finally {
            setLoadingPortal(false);
        }
    }, [canManageBilling, noBillingPermissionMessage]);

    return { loadingPortal, handleManageSubscription };
}
