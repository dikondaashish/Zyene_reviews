import type { SetupProgress } from "@/lib/automations/setup-progress";

/** Things that need the owner, most urgent first. Each one links straight to where it is done. */
export type WaitingTaskKind = "approvals" | "low-ratings" | "broken-links" | "setup";

export type WaitingTask = { kind: WaitingTaskKind; title: string; detail: string; href: string; cta: string };

export type WaitingTasksInput = {
    pendingApprovals: number;
    /** Visible 1–2★ reviews with no reply yet. */
    unansweredLowRatings: number;
    brokenLinks: number;
    setup: SetupProgress | null;
};

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

export function buildWaitingTasks(input: WaitingTasksInput): WaitingTask[] {
    const tasks: WaitingTask[] = [];
    if (input.pendingApprovals > 0) {
        const n = input.pendingApprovals;
        tasks.push({
            kind: "approvals",
            title: `${n} ${plural(n, "reply is", "replies are")} waiting for your approval`,
            detail: "Drafted for you. Check the wording, then post it to Google.",
            href: "/reviews/approvals",
            cta: "Review",
        });
    }
    if (input.unansweredLowRatings > 0) {
        const n = input.unansweredLowRatings;
        tasks.push({
            kind: "low-ratings",
            title: `${n} unhappy ${plural(n, "review has", "reviews have")} no reply`,
            detail: "1 and 2-star reviews. A calm, quick reply shows future customers you care.",
            href: "/reviews?status=needs_response&sort=lowest",
            cta: "Reply",
        });
    }
    if (input.brokenLinks > 0) {
        const n = input.brokenLinks;
        tasks.push({
            kind: "broken-links",
            title: `${n} ${plural(n, "link on your listing is", "links on your listing are")} broken`,
            detail: "Customers who tap them get an error page.",
            href: "/settings/business-information",
            cta: "Fix",
        });
    }
    if (input.setup?.next) {
        tasks.push({
            kind: "setup",
            title: `Finish setup: ${input.setup.next.label.toLowerCase()}`,
            detail: `${input.setup.percent}% set up. ${input.setup.doneCount} of ${input.setup.steps.length} steps done.`,
            href: input.setup.next.href,
            cta: input.setup.next.cta,
        });
    }
    return tasks;
}
