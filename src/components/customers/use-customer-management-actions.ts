"use client";

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Customer } from "@/components/customers/customer-table";
import { buildCustomerExportCsv, fetchAllCustomersForExport } from "@/components/customers/customer-management-export";
import { useCustomerManagementBulkAndCampaign } from "@/components/customers/use-customer-management-bulk-campaign";

type FetchOpts = { silent?: boolean };

export function useCustomerManagementActions(params: {
    businessId: string;
    displayedCustomers: Customer[];
    selectedIds: string[];
    setCustomers: Dispatch<SetStateAction<Customer[]>>;
    setSelectedIds: Dispatch<SetStateAction<string[]>>;
    setIsExporting: (v: boolean) => void;
    fetchCustomers: (opts?: FetchOpts) => Promise<void>;
    loadStats: () => Promise<void>;
}) {
    const router = useRouter();
    const {
        businessId,
        displayedCustomers,
        selectedIds,
        setCustomers,
        setSelectedIds,
        setIsExporting,
        fetchCustomers,
        loadStats,
    } = params;

    const { handleBulkAction, onBulkSendCampaign } = useCustomerManagementBulkAndCampaign({
        businessId,
        displayedCustomers,
        selectedIds,
        setSelectedIds,
        fetchCustomers,
    });

    const handleCustomerUpdated = useCallback(
        (updated: Customer) => {
            setCustomers((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
            void loadStats();
        },
        [loadStats, setCustomers]
    );

    const sendRequestToCustomer = useCallback(
        async (customer: Customer) => {
            if (!businessId) return;
            if (customer.is_opted_out) {
                toast.error("This contact opted out of review requests.");
                return;
            }
            if (!customer.phone) {
                toast.error("Add a phone number to send an SMS review request.");
                return;
            }
            try {
                const response = await fetch("/api/customers/bulk", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ids: [customer.id], businessId, action: "request" }),
                });
                const json = await response.json();
                if (!response.ok) throw new Error(json.error || "Failed to send request");
                toast.success("Review request sent!");
                await fetchCustomers({ silent: true });
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to send request");
            }
        },
        [businessId, fetchCustomers]
    );

    const handleDelete = useCallback(
        async (id: string) => {
            try {
                const response = await fetch("/api/customers", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, businessId }),
                });
                if (!response.ok) throw new Error("Failed to delete");
                setCustomers((prev) => prev.filter((c) => c.id !== id));
                setSelectedIds((prev) => prev.filter((x) => x !== id));
                toast.success("Customer deleted");
                router.refresh();
                await fetchCustomers({ silent: true });
            } catch {
                toast.error("Failed to delete customer");
            }
        },
        [businessId, fetchCustomers, router, setCustomers, setSelectedIds]
    );

    const handleExportCsv = useCallback(async () => {
        if (!businessId) return;
        setIsExporting(true);
        try {
            const all = await fetchAllCustomersForExport(businessId);
            const csv = buildCustomerExportCsv(all);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `customers-export-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`Exported ${all.length} customer(s).`);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Export failed");
        } finally {
            setIsExporting(false);
        }
    }, [businessId, setIsExporting]);

    return {
        handleBulkAction,
        handleCustomerUpdated,
        sendRequestToCustomer,
        handleDelete,
        onBulkSendCampaign,
        handleExportCsv,
    };
}
