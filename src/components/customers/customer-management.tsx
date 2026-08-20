"use client";

import type { Customer } from "@/components/customers/customer-table";
import { useCustomerManagement } from "@/components/customers/use-customer-management";
import { CustomerManagementHeader } from "@/components/customers/customer-management-header";
import { CustomerManagementStatsGrid } from "@/components/customers/customer-management-stats-grid";
import { CustomerManagementFilterToolbar } from "@/components/customers/customer-management-filter-toolbar";
import { CustomerManagementListRegion } from "@/components/customers/customer-management-list-region";
import { CustomerManagementDialogs } from "@/components/customers/customer-management-dialogs";
import { BulkActionBar } from "@/components/customers/bulk-action-bar";

interface CustomerManagementProps {
    businessId: string;
    initialCustomers: Customer[];
}

export function CustomerManagement({ businessId, initialCustomers }: CustomerManagementProps) {
    const cm = useCustomerManagement(businessId, initialCustomers);

    return (
        <div className="min-w-0 animate-in fade-in overflow-x-hidden duration-500">
            <CustomerManagementHeader
                onImportClick={() => cm.setIsImportModalOpen(true)}
                onExportClick={() => void cm.handleExportCsv()}
                onAddClick={() => cm.setIsAddModalOpen(true)}
                isExporting={cm.isExporting}
            />

            <CustomerManagementStatsGrid stats={cm.resolvedStats} />

            <CustomerManagementFilterToolbar
                searchQuery={cm.search}
                allTags={cm.allTagsForFilter}
                tagFilter={cm.tagFilter}
                onTagFilterChange={cm.setTagFilter}
                onSearchChange={cm.setSearch}
                smartTab={cm.smartTab}
                onSmartTabChange={cm.setSmartTab}
                segmentCounts={cm.segmentCountsForTabs}
            />

            {cm.selectedIds.length > 0 && (
                <BulkActionBar
                    selectedCount={cm.selectedIds.length}
                    onClear={() => cm.setSelectedIds([])}
                    onDelete={() => cm.setBulkDeleteOpen(true)}
                    onSendRequests={cm.onBulkSendCampaign}
                    onAddTag={() => void cm.handleBulkAction("tag", { tags: ["VIP"], mode: "add" })}
                    sendRequestsBlocked={cm.bulkSendBlocked}
                    sendRequestsBlockedReason="Selected contacts are opted out of review requests."
                />
            )}

            <CustomerManagementListRegion
                businessId={businessId}
                isLoading={cm.isLoading}
                listEmpty={cm.listEmpty}
                filteredEmpty={cm.filteredEmpty}
                databaseEmpty={cm.databaseEmpty}
                displayedCustomers={cm.displayedCustomers}
                search={cm.search}
                tagFilter={cm.tagFilter}
                onClearFilters={() => {
                    cm.setSearch("");
                    cm.setTagFilter("");
                }}
                onShowAllTab={() => cm.setSmartTab("all")}
                onOpenAdd={() => cm.setIsAddModalOpen(true)}
                onOpenImport={() => cm.setIsImportModalOpen(true)}
                onDelete={cm.handleDelete}
                onCustomerUpdated={cm.handleCustomerUpdated}
                onSendRequest={cm.sendRequestToCustomer}
                onSelectionChange={cm.setSelectedIds}
                onCustomersMerged={cm.handleCustomersMerged}
            />

            <CustomerManagementDialogs
                businessId={businessId}
                bulkDeleteOpen={cm.bulkDeleteOpen}
                onBulkDeleteOpenChange={cm.setBulkDeleteOpen}
                selectedIds={cm.selectedIds}
                onBulkDeleteConfirm={() => {
                    cm.setBulkDeleteOpen(false);
                    void cm.handleBulkAction("delete");
                }}
                isAddModalOpen={cm.isAddModalOpen}
                onAddModalOpenChange={cm.setIsAddModalOpen}
                onAddSuccess={() => void cm.fetchCustomers({ silent: true })}
                isImportModalOpen={cm.isImportModalOpen}
                onImportModalOpenChange={cm.setIsImportModalOpen}
                onImportSuccess={() => void cm.fetchCustomers({ silent: true })}
            />
        </div>
    );
}
