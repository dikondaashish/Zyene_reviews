"use client";

import type { Customer } from "@/components/customers/customer-table";
import { useCustomerManagementData } from "@/components/customers/use-customer-management-data";
import { useCustomerManagementViews } from "@/components/customers/use-customer-management-views";
import { useCustomerManagementActions } from "@/components/customers/use-customer-management-actions";

export function useCustomerManagement(businessId: string, initialCustomers: Customer[]) {
    const data = useCustomerManagementData(businessId, initialCustomers);
    const views = useCustomerManagementViews(
        data.customers,
        initialCustomers,
        data.smartTab,
        data.selectedIds,
        data.isLoading,
        data.stats
    );
    const actions = useCustomerManagementActions({
        businessId,
        displayedCustomers: views.displayedCustomers,
        selectedIds: data.selectedIds,
        setCustomers: data.setCustomers,
        setSelectedIds: data.setSelectedIds,
        setIsExporting: data.setIsExporting,
        fetchCustomers: data.fetchCustomers,
        loadStats: data.loadStats,
    });

    return { ...data, ...views, ...actions };
}
