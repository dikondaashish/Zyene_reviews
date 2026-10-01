"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchBillingInvoices } from "@/lib/billing/fetch-invoices";

export function useBillingInvoices(organizationId: string, enabled: boolean) {
    return useInfiniteQuery({
        queryKey: ["billing-invoices", organizationId],
        initialPageParam: null as string | null,
        queryFn: ({ pageParam, signal }) => fetchBillingInvoices(organizationId, pageParam, signal),
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        enabled,
        staleTime: 30_000,
        refetchOnMount: "always",
        refetchOnWindowFocus: "always",
        retry: false,
    });
}
