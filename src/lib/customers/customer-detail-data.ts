import type { Database } from "@/lib/db/supabase/database.types";
import { requestMatchesCustomer } from "@/lib/customers/review-linkage";

type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];
type ReviewRequestRow = Database["public"]["Tables"]["review_requests"]["Row"];
type PrivateFeedbackRow = Database["public"]["Tables"]["private_feedback"]["Row"];

export type TimelineRequestItem = {
    type: "request";
    id: string;
    sortAt: string;
    channel: string;
    status: string;
    sent_at: string | null;
    opened_at: string | null;
    clicked_at: string | null;
    completed_at: string | null;
    review_left: boolean;
};

export type TimelineFeedbackItem = {
    type: "feedback";
    id: string;
    sortAt: string;
    rating: number;
    content: string | null;
    review_request_id: string | null;
};

export type TimelinePlatformReviewItem = {
    type: "platform_review";
    id: string;
    sortAt: string;
    rating: number;
    platform: string;
    text: string | null;
};

export type TimelineItem = TimelineRequestItem | TimelineFeedbackItem | TimelinePlatformReviewItem;

export type CustomerDetailStats = {
    totalRequestsSent: number;
    reviewsLeftCount: number;
    lastContactedAt: string | null;
    lastRequestStatus: string;
};

/** User-facing label for raw `review_requests.status` values. */
export function humanizeRequestStatus(status: string): string {
    const key = status.trim().toLowerCase().replace(/\s+/g, "_");
    const labels: Record<string, string> = {
        sending: "Sending",
        queued: "Queued",
        pending: "Pending",
        failed: "Failed",
        delivered: "Delivered",
        sent: "Sent",
        opened: "Opened",
        clicked: "Clicked",
        review_left: "Review left",
        completed: "Completed",
        feedback_left: "Feedback left",
        skipped: "Skipped",
    };
    if (labels[key]) return labels[key];
    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (m) => m.toUpperCase())
        .trim();
}

export function lastRequestEngagementLabel(r: ReviewRequestRow | null | undefined): string {
    if (!r) return "—";
    if (r.review_left || r.completed_at) return "Reviewed";
    if (r.clicked_at) return "Clicked";
    if (r.opened_at) return "Opened";
    if (r.sent_at) return "Sent";
    return humanizeRequestStatus(r.status || "pending");
}

export function computeReviewsLeftCount(
    requests: Pick<ReviewRequestRow, "id" | "review_left">[],
    feedback: Pick<PrivateFeedbackRow, "review_request_id">[]
): number {
    const fbReqIds = new Set(
        feedback.map((f) => f.review_request_id).filter((id): id is string => id != null && id.length > 0)
    );
    const fromRequests = requests.filter((r) => r.review_left && !fbReqIds.has(r.id)).length;
    return feedback.length + fromRequests;
}

export function buildCustomerTimeline(
    requests: ReviewRequestRow[],
    feedback: PrivateFeedbackRow[]
): TimelineItem[] {
    const items: TimelineItem[] = [];
    for (const r of requests) {
        const sortAt = r.sent_at || r.created_at;
        items.push({
            type: "request",
            id: r.id,
            sortAt,
            channel: r.channel,
            status: r.status,
            sent_at: r.sent_at,
            opened_at: r.opened_at,
            clicked_at: r.clicked_at,
            completed_at: r.completed_at,
            review_left: r.review_left,
        });
    }
    for (const f of feedback) {
        items.push({
            type: "feedback",
            id: f.id,
            sortAt: f.created_at,
            rating: f.rating,
            content: f.content,
            review_request_id: f.review_request_id,
        });
    }
    items.sort((a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime());
    return items;
}

export function filterRequestsForCustomer(
    customer: Pick<CustomerRow, "email" | "phone">,
    rows: ReviewRequestRow[]
): ReviewRequestRow[] {
    return rows.filter((r) =>
        requestMatchesCustomer(customer, {
            customer_phone: r.customer_phone,
            customer_email: r.customer_email,
        })
    );
}

export function filterFeedbackForCustomer(
    customer: Pick<CustomerRow, "email" | "phone">,
    rows: PrivateFeedbackRow[]
): PrivateFeedbackRow[] {
    return rows.filter((p) =>
        requestMatchesCustomer(customer, {
            customer_phone: p.customer_phone,
            customer_email: p.customer_email,
        })
    );
}

export function computeDetailStats(
    customer: CustomerRow,
    matchedRequests: ReviewRequestRow[],
    matchedFeedback: PrivateFeedbackRow[]
): CustomerDetailStats {
    const sorted = [...matchedRequests].sort(
        (a, b) =>
            new Date(b.sent_at || b.created_at).getTime() - new Date(a.sent_at || a.created_at).getTime()
    );
    const last = sorted[0] ?? null;
    return {
        totalRequestsSent: customer.total_requests_sent ?? 0,
        reviewsLeftCount: computeReviewsLeftCount(
            matchedRequests.map((r) => ({ id: r.id, review_left: r.review_left })),
            matchedFeedback.map((f) => ({ review_request_id: f.review_request_id }))
        ),
        lastContactedAt: customer.last_request_sent_at,
        lastRequestStatus: lastRequestEngagementLabel(last),
    };
}
