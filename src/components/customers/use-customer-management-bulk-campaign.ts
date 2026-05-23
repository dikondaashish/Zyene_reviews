"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import type { Dispatch, SetStateAction } from "react";
import type { Customer } from "@/components/customers/customer-table";
import type { BulkActionPayload } from "@/components/customers/customer-management-types";

type FetchOpts = { silent?: boolean };

export function useCustomerManagementBulkAndCampaign(params: {
    businessId: string;
    displayedCustomers: Customer[];
    selectedIds: string[];
    setSelectedIds: Dispatch<SetStateAction<string[]>>;
    fetchCustomers: (opts?: FetchOpts) => Promise<void>;
}) {
    const router = useRouter();
    const { businessId, displayedCustomers, selectedIds, setSelectedIds, fetchCustomers } = params;

    const handleBulkAction = useCallback(
        async (action: "delete" | "tag" | "request", data?: BulkActionPayload) => {
            if (!businessId || selectedIds.length === 0) return;
            const promise = fetch("/api/customers/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds, businessId, action, data }),
            });
            toast.promise(promise, {
                loading: `Processing bulk ${action}...`,
                success: () => {
                    if (action === "request") {
                        const root = document.documentElement;
                        const cs = getComputedStyle(root);
                        const c1 = cs.getPropertyValue("--chart-1").trim() || "var(--primary)";
                        const c2 = cs.getPropertyValue("--chart-2").trim() || "var(--primary)";
                        const c3 = cs.getPropertyValue("--chart-3").trim() || "var(--primary)";
                        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: [c1, c2, c3] });
                        return "Review requests sent successfully!";
                    }
                    void fetchCustomers({ silent: true });
                    setSelectedIds([]);
                    return `Bulk ${action} completed!`;
                },
                error: "Failed to perform bulk action",
            });
        },
        [businessId, fetchCustomers, selectedIds, setSelectedIds]
    );

    const onBulkSendCampaign = useCallback(() => {
        if (selectedIds.length === 0) return;
        const eligibleIds = displayedCustomers.reduce<string[]>((acc, c) => {
            if (selectedIds.includes(c.id) && !c.is_opted_out) acc.push(c.id);
            return acc;
        }, []);
        if (eligibleIds.length === 0) {
            toast.error("None of the selected contacts can receive requests (opted out).");
            return;
        }
        if (eligibleIds.length < selectedIds.length) {
            toast.message(`Skipping ${selectedIds.length - eligibleIds.length} opted-out contact(s).`);
        }
        const q = encodeURIComponent(eligibleIds.join(","));
        router.push(`/campaigns/new?customerIds=${q}`);
        toast.message("Continue in the campaign builder with your selected customers.");
    }, [displayedCustomers, router, selectedIds]);

    return { handleBulkAction, onBulkSendCampaign };
}
