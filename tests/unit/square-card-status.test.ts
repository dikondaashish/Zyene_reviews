import { describe, expect, it } from "vitest";
import {
    squareLastEventSummary,
    squarePaymentStatusLabel,
} from "@/components/integrations/square-card-status";

describe("squarePaymentStatusLabel", () => {
    it("maps known statuses", () => {
        expect(squarePaymentStatusLabel("sent")).toBe("Review request sent");
        expect(squarePaymentStatusLabel("skipped_guard")).toBe(
            "Skipped - send rule (cap, opt-out or minimum)",
        );
        expect(squarePaymentStatusLabel("sending")).toBe("Scheduled - sending after delay");
    });

    it("falls back for unknown statuses", () => {
        expect(squarePaymentStatusLabel("custom_thing")).toBe("custom thing");
    });
});

describe("squareLastEventSummary", () => {
    it("includes email and relative time", () => {
        const line = squareLastEventSummary({
            status: "sent",
            customerEmail: "a@b.c",
            createdAt: "2026-01-01T00:00:00Z",
            timeAgo: () => "2h ago",
        });
        expect(line).toBe("Review request sent · a@b.c · 2h ago");
    });
});
