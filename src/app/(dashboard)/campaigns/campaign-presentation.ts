import type { Campaign } from "./campaigns-list-types";

export type CampaignsSummary = {
    running: number;
    paused: number;
    drafts: number;
    asked: number;
    responded: number;
    responseRate: number;
    confirmedReviews: number;
};

/** "Responded" is total_completed: the customer left private feedback or went on to Google. */
export function summarizeCampaigns(campaigns: Campaign[]): CampaignsSummary {
    const asked = campaigns.reduce((sum, c) => sum + (c.total_sent || 0), 0);
    const responded = campaigns.reduce((sum, c) => sum + (c.total_completed || 0), 0);
    return {
        // "processing" is a legacy running state (see campaign-send-api.ts), so it counts as running.
        running: campaigns.filter((c) => c.status === "active" || c.status === "processing").length,
        paused: campaigns.filter((c) => c.status === "paused").length,
        drafts: campaigns.filter((c) => c.status === "draft").length,
        asked,
        responded,
        responseRate: asked > 0 ? Math.round((responded / asked) * 100) : 0,
        confirmedReviews: campaigns.reduce((sum, c) => sum + (c.total_reviews_received || 0), 0),
    };
}

export type CampaignStatusNote = {
    label: string;
    note: string;
    tone: "success" | "warning" | "muted";
};

/** What the status means for the owner, in one line, so a badge is never the whole story. */
export function getCampaignStatusNote(campaign: Pick<Campaign, "status" | "total_sent">): CampaignStatusNote {
    switch (campaign.status) {
        case "active":
            return { label: "Running", note: "Asking customers and sending reminders automatically.", tone: "success" };
        case "processing":
            return { label: "Sending now", note: "Sending the first messages to this group right now.", tone: "success" };
        case "archived":
            return { label: "Archived", note: "Kept for its results. Nothing is being sent.", tone: "muted" };
        case "paused":
            return { label: "Paused", note: "Nobody is being asked or reminded until you resume it.", tone: "warning" };
        case "completed":
            return { label: "Finished", note: "Everyone in this campaign has been asked.", tone: "muted" };
        default:
            return {
                label: "Draft",
                note: campaign.total_sent > 0 ? "Not running. Start it again, then add customers." : "Not running yet. Start it, then add customers to begin asking.",
                tone: "muted",
            };
    }
}

export const CHANNEL_LABEL: Record<string, string> = {
    sms: "Text message",
    email: "Email",
    both: "Text + email",
};
