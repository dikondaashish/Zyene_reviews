"use client";

import type { SegmentCounts, SmartSegmentTab } from "@/components/customers/customer-segment-tabs";
import { CustomerFilters } from "@/components/customers/customer-filters";
import { CustomerSegmentTabs } from "@/components/customers/customer-segment-tabs";

export function CustomerManagementFilterToolbar({
    searchQuery,
    allTags,
    tagFilter,
    onTagFilterChange,
    onSearchChange,
    smartTab,
    onSmartTabChange,
    segmentCounts,
}: {
    searchQuery: string;
    allTags: string[];
    tagFilter: string;
    onTagFilterChange: (v: string) => void;
    onSearchChange: (v: string) => void;
    smartTab: SmartSegmentTab;
    onSmartTabChange: (v: SmartSegmentTab) => void;
    segmentCounts: SegmentCounts;
}) {
    return (
        <div className="mb-6 flex min-w-0 flex-col gap-4 rounded-2xl border border-border/60 bg-muted/15 p-3 shadow-sm sm:p-5">
            <CustomerFilters
                searchQuery={searchQuery}
                allTags={allTags}
                tagFilter={tagFilter}
                onTagFilterChange={onTagFilterChange}
                onSearchChange={onSearchChange}
            />
            <CustomerSegmentTabs value={smartTab} onChange={onSmartTabChange} counts={segmentCounts} />
        </div>
    );
}
