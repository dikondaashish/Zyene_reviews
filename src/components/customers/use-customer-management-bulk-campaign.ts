"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { executeCustomerBulkAction } from "@/components/customers/customer-bulk-action-request";
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
            const toastId = toast.loading(action === "request" ? "Sending review requests…" : "Updating customers…");
            try {
                const result = await executeCustomerBulkAction({ ids: selectedIds, businessId, action, data });
                if (action === "request") {
                    const sent = result.sent ?? 0;
                    const failed = result.failed ?? 0;
                    const skipped = result.skipped ?? Math.max(0, selectedIds.length - sent - failed);
                    const message = `${sent} sent · ${failed} failed · ${skipped} skipped`;
                    if (failed || skipped) toast.warning(message, { id: toastId, description: "Unsent customers remain selected. Check request history before retrying." });
                    else toast.success(message, { id: toastId });
                    setSelectedIds(result.failedIds && result.skippedIds
                        ? [...result.failedIds, ...result.skippedIds]
                        : failed || skipped ? selectedIds : []);
                } else {
                    toast.success(action === "delete" ? "Customers deleted" : "Customer tags updated", { id: toastId });
                    setSelectedIds([]);
                }
                await fetchCustomers({ silent: true });
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not complete the action", { id: toastId });
            }
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
