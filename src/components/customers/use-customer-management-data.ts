"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Customer } from "@/components/customers/customer-table";
import type { SmartSegmentTab } from "@/components/customers/customer-segment-tabs";
import {
    emptySegmentCounts,
    type CustomerManagementStats,
} from "@/components/customers/customer-management-constants";

export function useCustomerManagementData(businessId: string, initialCustomers: Customer[]) {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [tagFilter, setTagFilter] = useState("");
    const [smartTab, setSmartTab] = useState<SmartSegmentTab>("all");
    const [isExporting, setIsExporting] = useState(false);
    const [stats, setStats] = useState<CustomerManagementStats | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const loadStats = useCallback(async () => {
        if (!businessId) return;
        try {
            const res = await fetch(`/api/customers/stats?businessId=${encodeURIComponent(businessId)}`, {
                cache: "no-store",
            });
            const json = await res.json();
            if (!res.ok || json.success === false) {
                throw new Error(json.error || "Failed to load stats");
            }
            const d = json.data ?? json;
            setStats({
                totalCustomers: d.totalCustomers,
                reviewConversionPercent: d.reviewConversionPercent,
                neverReviewedCount: d.neverReviewedCount,
                avgRequestsSent: d.avgRequestsSent,
                segmentCounts: d.segmentCounts ?? emptySegmentCounts,
            });
        } catch {
            /* ignore */
        }
    }, [businessId]);

    useEffect(() => {
        void loadStats();
    }, [loadStats]);

    const fetchCustomers = useCallback(
        async (opts?: { silent?: boolean }) => {
            if (!businessId) return;
            if (!opts?.silent) setIsLoading(true);
            try {
                const queryParams = new URLSearchParams({
                    businessId,
                    search,
                    limit: "5000",
                });
                if (tagFilter) queryParams.set("tags", tagFilter);
                const response = await fetch(`/api/customers?${queryParams}`, { cache: "no-store" });
                const json = await response.json();
                if (!response.ok || json.success === false) {
                    throw new Error(json.error || "Request failed");
                }
                const payload = json.data ?? json;
                setCustomers(payload.customers || []);
                await loadStats();
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "An unexpected error occurred";
                toast.error("Failed to fetch customers: " + message);
            } finally {
                if (!opts?.silent) setIsLoading(false);
            }
        },
        [businessId, search, tagFilter, loadStats]
    );

    useEffect(() => {
        if (search || tagFilter) {
            void fetchCustomers();
        } else {
            setCustomers(initialCustomers);
        }
    }, [search, tagFilter, initialCustomers, fetchCustomers]);

    return {
        customers,
        setCustomers,
        isLoading,
        selectedIds,
        setSelectedIds,
        bulkDeleteOpen,
        setBulkDeleteOpen,
        search,
        setSearch,
        tagFilter,
        setTagFilter,
        smartTab,
        setSmartTab,
        isExporting,
        setIsExporting,
        stats,
        isAddModalOpen,
        setIsAddModalOpen,
        isImportModalOpen,
        setIsImportModalOpen,
        loadStats,
        fetchCustomers,
    };
}
