import { describe, expect, it } from "vitest";
import { getCampaignStatusNote, summarizeCampaigns } from "@/app/(dashboard)/campaigns/campaign-presentation";
import type { Campaign } from "@/app/(dashboard)/campaigns/campaigns-list-types";

const campaign = (patch: Partial<Campaign>): Campaign => ({
    id: "c", name: "C", status: "active", channel: "sms", trigger_type: "manual_batch", total_sent: 0, total_opened: 0,
    total_clicked: 0, total_completed: 0, total_reviews_received: 0, created_at: "2026-10-01T00:00:00.000Z", ...patch,
});

describe("summarizeCampaigns", () => {
    it("adds up every campaign and rounds the response rate", () => {
        expect(summarizeCampaigns([
            campaign({ status: "active", total_sent: 200, total_completed: 50, total_reviews_received: 7 }),
            campaign({ status: "paused", total_sent: 100, total_completed: 20, total_reviews_received: 1 }),
            campaign({ status: "draft" }),
        ])).toEqual({ running: 1, paused: 1, drafts: 1, asked: 300, responded: 70, responseRate: 23, confirmedReviews: 8 });
    });

    it("reports a 0% response rate when nobody was asked", () => {
        expect(summarizeCampaigns([campaign({ status: "draft" })]).responseRate).toBe(0);
    });
});

describe("getCampaignStatusNote", () => {
    it.each([
        ["active", "Running", "success"],
        ["processing", "Sending now", "success"],
        ["paused", "Paused", "warning"],
        ["completed", "Finished", "muted"],
        ["archived", "Archived", "muted"],
        ["draft", "Draft", "muted"],
    ])("%s reads as %s", (status, label, tone) => {
        expect(getCampaignStatusNote({ status, total_sent: 0 })).toMatchObject({ label, tone });
    });

    it("tells a draft to start before adding customers, because sends need an active campaign", () => {
        expect(getCampaignStatusNote({ status: "draft", total_sent: 0 }).note).toBe("Not running yet. Start it, then add customers to begin asking.");
        expect(getCampaignStatusNote({ status: "draft", total_sent: 5 }).note).toBe("Not running. Start it again, then add customers.");
    });

    it("counts legacy processing campaigns as running", () => {
        expect(summarizeCampaigns([campaign({ status: "processing" }), campaign({ status: "active" })]).running).toBe(2);
    });
});
