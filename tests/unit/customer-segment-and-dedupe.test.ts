import { describe, expect, it } from "vitest";

import { dedupeCustomersByIdentity } from "@/lib/customers/dedupe-by-identity";
import { computeCustomerManagementMetrics, computeCustomerSegmentCounts } from "@/lib/customers/segment-counts";

describe("dedupeCustomersByIdentity", () => {
    it("keeps one row per normalized email and prefers the record with more requests", () => {
        const customers = dedupeCustomersByIdentity([
            {
                id: "a",
                email: "pat@example.com",
                phone: null,
                created_at: "2026-01-01T00:00:00.000Z",
                total_requests_sent: 1,
            },
            {
                id: "b",
                email: "PAT@example.com",
                phone: null,
                created_at: "2026-02-01T00:00:00.000Z",
                total_requests_sent: 4,
            },
        ]);

        expect(customers).toHaveLength(1);
        expect(customers[0]?.id).toBe("b");
    });

    it("keeps contacts without email or phone", () => {
        const customers = dedupeCustomersByIdentity([
            {
                id: "a",
                email: null,
                phone: null,
                created_at: "2026-01-01T00:00:00.000Z",
                total_requests_sent: 0,
            },
            {
                id: "b",
                email: null,
                phone: null,
                created_at: "2026-02-01T00:00:00.000Z",
                total_requests_sent: 0,
            },
        ]);

        expect(customers).toHaveLength(2);
    });
});

describe("computeCustomerSegmentCounts", () => {
    it("counts all customers and segment buckets from loaded rows", () => {
        const counts = computeCustomerSegmentCounts([
            {
                email: "a@example.com",
                phone: null,
                total_requests_sent: 2,
                created_at: "2026-08-01T00:00:00.000Z",
                last_request_sent_at: "2026-08-02T00:00:00.000Z",
                has_linked_review: false,
                is_opted_out: false,
            },
            {
                email: "b@example.com",
                phone: null,
                total_requests_sent: 1,
                created_at: "2026-01-01T00:00:00.000Z",
                last_request_sent_at: null,
                has_linked_review: true,
                is_opted_out: false,
            },
        ]);

        expect(counts.all).toBe(2);
        expect(counts.never_reviewed).toBe(1);
        expect(counts.already_reviewed).toBe(1);
    });

    it("leaves opted-out customers out of the asked-no-response group, since they cannot be reminded", () => {
        const base = { phone: null, total_requests_sent: 1, created_at: "2026-08-01T00:00:00.000Z", last_request_sent_at: null, has_linked_review: false };
        const customers = [
            { ...base, email: "a@example.com", is_opted_out: false },
            { ...base, email: "b@example.com", is_opted_out: true },
        ];
        expect(computeCustomerSegmentCounts(customers).never_reviewed).toBe(1);
        expect(computeCustomerManagementMetrics(customers).neverReviewedCount).toBe(1);
    });
});

describe("asked-no-response group", () => {
    it("leaves test contacts out of both the count and the stat, so they always match", () => {
        const base = { email: "x@example.com", phone: null, total_requests_sent: 1, created_at: "2026-08-01T00:00:00.000Z", last_request_sent_at: null, has_linked_review: false, is_opted_out: false };
        const customers = [{ ...base, tags: [] }, { ...base, email: "t@example.com", tags: ["zyene:test"] }];
        expect(computeCustomerSegmentCounts(customers).never_reviewed).toBe(1);
        expect(computeCustomerManagementMetrics(customers).neverReviewedCount).toBe(1);
    });
});
