"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AeoBalanceResponse } from "@/services/aeo/billing/balance-api";

export const AEO_BALANCE_QUERY_KEY = ["aeo-balance"] as const;

async function fetchAeoBalance(): Promise<AeoBalanceResponse> {
    const res = await fetch("/api/aeo/balance", { cache: "no-store" });
    const json = (await res.json().catch(() => null)) as { success?: boolean; data?: AeoBalanceResponse; error?: string } | null;
    if (!res.ok || !json?.success || !json.data) throw new Error(json?.error || "Unable to load balance");
    return json.data;
}

/**
 * The prepaid AEO balance for the active organization. Also handles the return
 * from Stripe Checkout: the balance is credited by webhook a moment after the
 * redirect, so it refetches a few times instead of showing a stale number.
 */
export function useAeoBalance(enabled: boolean) {
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: AEO_BALANCE_QUERY_KEY,
        queryFn: fetchAeoBalance,
        enabled,
        staleTime: 30_000,
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        if (!enabled) return;
        const url = new URL(window.location.href);
        const topup = url.searchParams.get("topup");
        if (!topup) return;

        url.searchParams.delete("topup");
        window.history.replaceState(window.history.state, "", url.toString());

        if (topup === "canceled") {
            toast.message("Checkout canceled. No payment was taken.");
            return;
        }
        if (topup !== "success") return;

        toast.success("Payment received. Your balance will update in a few seconds.");
        const refresh = () => void queryClient.invalidateQueries({ queryKey: AEO_BALANCE_QUERY_KEY });
        const timers = [2_000, 6_000, 15_000].map((ms) => window.setTimeout(refresh, ms));
        return () => timers.forEach((t) => window.clearTimeout(t));
    }, [enabled, queryClient]);

    return query;
}
