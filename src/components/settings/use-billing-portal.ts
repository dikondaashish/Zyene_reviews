"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { parsePortalResponse } from "@/lib/billing/parse-portal-response";

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
            window.location.assign(parsePortalResponse(data));
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to open billing portal");
        } finally {
            setLoadingPortal(false);
        }
    }, [canManageBilling, noBillingPermissionMessage]);

    return { loadingPortal, handleManageSubscription };
}
