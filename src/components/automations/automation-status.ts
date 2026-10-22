import type { AutomationsOverview } from "@/services/automations/load-automations-overview";

export type AutomationStatus = {
    label: string;
    tone: "success" | "warning" | "destructive" | "muted";
    summary: string;
};

/** One sentence that answers "is this working?" before the owner reads anything else. */
export function getAutomationStatus(overview: AutomationsOverview): AutomationStatus {
    const { settings, counts } = overview;
    const running = counts.activeCampaigns + counts.activeImports;

    if (!settings.hasSlug) {
        return { label: "Not sending yet", tone: "destructive", summary: "Finish setting up your review page link so requests can go out." };
    }
    if (running > 0 && !settings.smsEnabled && !settings.emailEnabled) {
        return { label: "Paused", tone: "destructive", summary: "Text and email are both switched off, so no requests are going out." };
    }
    if (running === 0) {
        return { label: "Nothing running", tone: "muted", summary: "Start a campaign and we will ask your customers for reviews automatically." };
    }
    if (counts.failures7d > 0) {
        return {
            label: "Running, with problems",
            tone: "warning",
            summary: `Requests are going out, but ${counts.failures7d} did not reach the customer this week.`,
        };
    }
    return {
        label: "Running smoothly",
        tone: "success",
        summary: `${counts.upcoming} request${counts.upcoming === 1 ? "" : "s"} scheduled in the next 7 days.${
            overview.actions.length === 0 ? " Nothing needs your attention." : ""
        }`,
    };
}
