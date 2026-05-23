"use client";

import { useMemo } from "react";
import type { Customer } from "@/components/customers/customer-table";
import type { SmartSegmentTab } from "@/components/customers/customer-segment-tabs";
import {
    emptySegmentCounts,
    type CustomerManagementStats,
} from "@/components/customers/customer-management-constants";

export function useCustomerManagementViews(
    customers: Customer[],
    initialCustomers: Customer[],
    smartTab: SmartSegmentTab,
    selectedIds: string[],
    isLoading: boolean,
    stats: CustomerManagementStats | null
) {
    const since30 = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d;
    }, []);

    const displayedCustomers = useMemo(() => {
        const list = customers;
        switch (smartTab) {
            case "never_reviewed":
                return list.filter((c) => (c.total_requests_sent ?? 0) > 0 && !c.has_linked_review);
            case "already_reviewed":
                return list.filter((c) => Boolean(c.has_linked_review));
            case "recent":
                return list.filter((c) => {
                    const created = new Date(c.created_at).getTime();
                    const last = c.last_request_sent_at ? new Date(c.last_request_sent_at).getTime() : 0;
                    return created >= since30.getTime() || last >= since30.getTime();
                });
            case "no_contact":
                return list.filter((c) => !(c.email ?? "").trim() && !(c.phone ?? "").trim());
            case "opted_out":
                return list.filter((c) => Boolean(c.is_opted_out));
            default:
                return list;
        }
    }, [customers, smartTab, since30]);

    const allTagsForFilter = useMemo(() => {
        const set = new Set<string>();
        for (const c of initialCustomers) {
            for (const t of c.tags || []) {
                if (t) set.add(t);
            }
        }
        for (const c of customers) {
            for (const t of c.tags || []) {
                if (t) set.add(t);
            }
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [initialCustomers, customers]);

    const selectedEligibleForSend = useMemo(
        () => displayedCustomers.filter((c) => selectedIds.includes(c.id) && !c.is_opted_out).length,
        [displayedCustomers, selectedIds]
    );

    const bulkSendBlocked = selectedIds.length > 0 && selectedEligibleForSend === 0;
    const segmentCountsForTabs = stats?.segmentCounts ?? emptySegmentCounts;
    const listEmpty = !isLoading && displayedCustomers.length === 0;
    const filteredEmpty = listEmpty && customers.length > 0;
    const databaseEmpty = listEmpty && customers.length === 0;

    return {
        displayedCustomers,
        allTagsForFilter,
        bulkSendBlocked,
        segmentCountsForTabs,
        listEmpty,
        filteredEmpty,
        databaseEmpty,
    };
}
