import type { SegmentCounts } from "@/components/customers/customer-segment-tabs";

export const emptySegmentCounts: SegmentCounts = {
    all: 0,
    never_reviewed: 0,
    already_reviewed: 0,
    recent: 0,
    no_contact: 0,
    opted_out: 0,
};

export type CustomerManagementStats = {
    totalCustomers: number;
    reviewConversionPercent: number;
    neverReviewedCount: number;
    avgRequestsSent: number;
    segmentCounts: SegmentCounts;
};
