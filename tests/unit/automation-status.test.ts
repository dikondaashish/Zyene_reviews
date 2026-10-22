import { describe, expect, it } from "vitest";
import { getAutomationStatus } from "@/components/automations/automation-status";
import type { AutomationsOverview } from "@/services/automations/load-automations-overview";

function overview(patch: { settings?: Partial<AutomationsOverview["settings"]>; counts?: Partial<AutomationsOverview["counts"]>; actions?: AutomationsOverview["actions"] } = {}): AutomationsOverview {
    return {
        settings: {
            smsEnabled: true, emailEnabled: true, quietHoursEnabled: false, quietStart: "21:00", quietEnd: "08:00",
            timezone: null, replyRulesEnabled: false, autoReplyEnabled: false, hasSlug: true, ...patch.settings,
        },
        counts: { activeCampaigns: 1, activeReminders: 0, upcoming: 3, activeImports: 0, pendingApprovals: 0, failures7d: 0, ...patch.counts },
        upcoming: [], recent: [], failures: [], actions: patch.actions ?? [],
    };
}

describe("getAutomationStatus", () => {
    it("blocks sending until the review page link exists", () => {
        expect(getAutomationStatus(overview({ settings: { hasSlug: false } })).label).toBe("Not sending yet");
    });

    it("reports paused when both channels are off with campaigns running", () => {
        expect(getAutomationStatus(overview({ settings: { smsEnabled: false, emailEnabled: false } })).label).toBe("Paused");
    });

    it("is idle, not paused, when nothing is running", () => {
        const status = getAutomationStatus(overview({ counts: { activeCampaigns: 0 }, settings: { smsEnabled: false, emailEnabled: false } }));
        expect(status.label).toBe("Nothing running");
    });

    it("surfaces failures as a warning", () => {
        const status = getAutomationStatus(overview({ counts: { failures7d: 2 } }));
        expect(status).toMatchObject({ label: "Running, with problems", tone: "warning" });
        expect(status.summary).toContain("2 did not reach");
    });

    it("only claims nothing needs attention when there are no actions", () => {
        expect(getAutomationStatus(overview()).summary).toContain("Nothing needs your attention");
        const withAction = getAutomationStatus(overview({ actions: [{ title: "x", href: "/" }] }));
        expect(withAction.summary).not.toContain("Nothing needs your attention");
    });
});
