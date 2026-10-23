/**
 * "How set up am I?" for the automations an owner relies on. Each step is one thing the
 * owner does once; the percentage is simply steps done out of steps.
 */
export type SetupProgressInput = {
    googleConnected: boolean;
    hasReviewLink: boolean;
    /** Reply rules on, or the single automatic-reply switch on. */
    repliesHandled: boolean;
    customerCount: number;
    /** An active campaign or customer import is asking people for reviews. */
    requestsRunning: boolean;
};

export type SetupStepId = "google" | "review-link" | "replies" | "customers" | "requests";

export type SetupStep = { id: SetupStepId; label: string; doneLabel: string; done: boolean; href: string; cta: string };

export type SetupProgress = { steps: SetupStep[]; doneCount: number; percent: number; next: SetupStep | null };

export function buildSetupProgress(input: SetupProgressInput): SetupProgress {
    const steps: SetupStep[] = [
        { id: "google", label: "Connect Google", doneLabel: "Google connected", done: input.googleConnected, href: "/settings/integrations", cta: "Connect Google" },
        { id: "review-link", label: "Set your review link", doneLabel: "Review link ready", done: input.hasReviewLink, href: "/settings/public-profile", cta: "Set review link" },
        { id: "replies", label: "Choose how reviews get replies", doneLabel: "Replies handled", done: input.repliesHandled, href: "/settings/reply-rules", cta: "Set reply rules" },
        { id: "customers", label: "Add your customers", doneLabel: "Customers added", done: input.customerCount > 0, href: "/customers", cta: "Add customers" },
        { id: "requests", label: "Start asking for reviews", doneLabel: "Requests running", done: input.requestsRunning, href: "/campaigns", cta: "Start a campaign" },
    ];
    const doneCount = steps.filter((s) => s.done).length;
    return {
        steps,
        doneCount,
        percent: Math.round((doneCount / steps.length) * 100),
        next: steps.find((s) => !s.done) ?? null,
    };
}
