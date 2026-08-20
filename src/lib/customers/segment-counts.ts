import type { SegmentCounts } from "@/components/customers/customer-segment-tabs";

export type CustomerSegmentInput = {
    email: string | null;
    phone: string | null;
    total_requests_sent: number | null;
    created_at: string;
    last_request_sent_at: string | null;
    is_opted_out?: boolean;
    has_linked_review?: boolean;
};

function isRecent(c: CustomerSegmentInput, since: Date): boolean {
    const created = new Date(c.created_at).getTime();
    const lastReq = c.last_request_sent_at ? new Date(c.last_request_sent_at).getTime() : 0;
    return created >= since.getTime() || lastReq >= since.getTime();
}

function hasContactInfo(c: { email: string | null; phone: string | null }): boolean {
    return Boolean((c.email ?? "").trim() || (c.phone ?? "").trim());
}

export function recentCustomerWindow(days = 30): Date {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return since;
}

export function computeCustomerSegmentCounts(
    customers: CustomerSegmentInput[],
    since: Date = recentCustomerWindow(),
): SegmentCounts {
    let never_reviewed = 0;
    let already_reviewed = 0;
    let recent = 0;
    let no_contact = 0;
    let opted_out = 0;

    for (const customer of customers) {
        if (customer.is_opted_out) opted_out++;
        const hasRequest = (customer.total_requests_sent ?? 0) > 0;
        const hasReview = Boolean(customer.has_linked_review);

        if (!hasContactInfo(customer)) no_contact++;
        if (hasRequest && !hasReview) never_reviewed++;
        if (hasReview) already_reviewed++;
        if (isRecent(customer, since)) recent++;
    }

    return {
        all: customers.length,
        never_reviewed,
        already_reviewed,
        recent,
        no_contact,
        opted_out,
    };
}

export function computeCustomerManagementMetrics(customers: CustomerSegmentInput[]) {
    const segmentCounts = computeCustomerSegmentCounts(customers);
    const totalCustomers = customers.length;
    const sumRequests = customers.reduce((acc, c) => acc + (c.total_requests_sent ?? 0), 0);
    const avgRequestsSent = totalCustomers > 0 ? sumRequests / totalCustomers : 0;
    const withRequest = customers.filter((c) => (c.total_requests_sent ?? 0) > 0);
    const withRequestAndReview = withRequest.filter((c) => Boolean(c.has_linked_review));
    const reviewConversionPercent =
        withRequest.length > 0 ? (withRequestAndReview.length / withRequest.length) * 100 : 0;
    const neverReviewedCount = withRequest.filter((c) => !c.has_linked_review).length;

    return {
        totalCustomers,
        reviewConversionPercent: Math.round(reviewConversionPercent * 10) / 10,
        neverReviewedCount,
        avgRequestsSent: Math.round(avgRequestsSent * 10) / 10,
        segmentCounts,
    };
}
