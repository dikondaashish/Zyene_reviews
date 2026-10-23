import { describe, expect, it } from "vitest";
import { buildSetupProgress } from "../../src/lib/automations/setup-progress";
import { buildWaitingTasks } from "../../src/lib/dashboard/waiting-tasks";
import { summarizeReplyRules } from "../../src/lib/reviews/reply-rules-summary";

const allDone = { googleConnected: true, hasReviewLink: true, repliesHandled: true, customerCount: 3, requestsRunning: true };

describe("buildSetupProgress", () => {
    it("is 100% with no next step when everything is done", () => {
        const p = buildSetupProgress(allDone);
        expect(p.percent).toBe(100);
        expect(p.next).toBeNull();
    });

    it("points at the first unfinished step in order", () => {
        const p = buildSetupProgress({ ...allDone, repliesHandled: false, requestsRunning: false });
        expect(p.doneCount).toBe(3);
        expect(p.percent).toBe(60);
        expect(p.next?.id).toBe("replies");
    });
});

describe("buildWaitingTasks", () => {
    it("returns nothing when nothing needs the owner", () => {
        expect(buildWaitingTasks({ pendingApprovals: 0, unansweredLowRatings: 0, brokenLinks: 0, setup: buildSetupProgress(allDone) })).toEqual([]);
    });

    it("orders approvals, unhappy reviews, broken links, then setup", () => {
        const tasks = buildWaitingTasks({
            pendingApprovals: 1, unansweredLowRatings: 12, brokenLinks: 8,
            setup: buildSetupProgress({ ...allDone, requestsRunning: false }),
        });
        expect(tasks.map((t) => t.kind)).toEqual(["approvals", "low-ratings", "broken-links", "setup"]);
        expect(tasks[0].title).toBe("1 reply is waiting for your approval");
        expect(tasks[1].title).toBe("12 unhappy reviews have no reply");
        expect(tasks[3].href).toBe("/campaigns");
    });
});

describe("summarizeReplyRules", () => {
    it("groups neighbouring ratings that share an action", () => {
        const rules = [1, 2, 3].map((rating) => ({ rating, action: "approval" }))
            .concat([4, 5].map((rating) => ({ rating, action: "auto" })));
        expect(summarizeReplyRules(rules)).toEqual(["1–3★ wait for your approval", "4–5★ get an AI reply posted"]);
    });

    it("keeps single ratings apart", () => {
        const rules = [
            { rating: 5, action: "auto" }, { rating: 4, action: "approval" }, { rating: 3, action: "auto" },
            { rating: 2, action: "ignore" }, { rating: 1, action: "ignore" },
        ];
        expect(summarizeReplyRules(rules)).toEqual(["1–2★ get no reply", "3★ get an AI reply posted", "4★ wait for your approval", "5★ get an AI reply posted"]);
    });
});
