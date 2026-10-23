/**
 * A campaign as the steps a customer actually goes through, mirroring the drip worker:
 * first message after `delay_minutes`, then (if follow-ups are on) up to two reminders
 * `follow_up_delay_hours` apart, stopping once the customer clicks or leaves a review.
 */
import { reminderDelayHours } from "@/lib/campaigns/drip-phase1";

export type CampaignFlowInput = {
    status: string;
    channel: string;
    delay_minutes: number | null;
    follow_up_enabled: boolean;
    follow_up_delay_hours: number | null;
    stop_on_click?: boolean | null;
};

export type SendReadiness = { smsEnabled: boolean; emailEnabled: boolean; hasReviewLink: boolean };

export type CampaignFlowStep =
    | { kind: "start"; label: string }
    | { kind: "wait"; label: string }
    | { kind: "send"; label: string; detail: string };

export type CampaignFlowBlocker = { title: string; href: string; cta: string };

export function formatWait(minutes: number): string {
    if (minutes <= 0) return "Right away";
    if (minutes < 60) return `Wait ${minutes} min`;
    const hours = minutes / 60;
    if (hours < 24) return `Wait ${Number.isInteger(hours) ? hours : hours.toFixed(1)} hour${hours === 1 ? "" : "s"}`;
    const days = Math.round(hours / 24);
    return `Wait ${days} day${days === 1 ? "" : "s"}`;
}

const channelText = (channel: string) => (channel === "sms" ? "By text" : channel === "email" ? "By email" : "By text and email");

export function buildCampaignFlow(c: CampaignFlowInput): CampaignFlowStep[] {
    const steps: CampaignFlowStep[] = [{ kind: "start", label: "Customer added to the campaign" }];
    const delay = Math.max(0, Number(c.delay_minutes ?? 0));
    steps.push({ kind: "wait", label: formatWait(delay) });
    steps.push({ kind: "send", label: "Send the review request", detail: channelText(c.channel) });
    if (c.follow_up_enabled) {
        const gap = formatWait(reminderDelayHours(c.follow_up_delay_hours) * 60);
        const stop = c.stop_on_click === false ? "If they haven't left a review" : "If they haven't opened the link";
        steps.push({ kind: "wait", label: gap });
        steps.push({ kind: "send", label: "Send reminder 1", detail: stop });
        steps.push({ kind: "wait", label: gap });
        steps.push({ kind: "send", label: "Send reminder 2", detail: stop });
    }
    return steps;
}

/** Settings that stop this campaign's messages from going out at all. */
export function campaignSendBlockers(c: CampaignFlowInput, r: SendReadiness): CampaignFlowBlocker[] {
    const blockers: CampaignFlowBlocker[] = [];
    const usesSms = c.channel === "sms" || c.channel === "both";
    const usesEmail = c.channel === "email" || c.channel === "both";
    if (!r.hasReviewLink) blockers.push({ title: "Your review page link isn't set, so requests have nowhere to send people", href: "/settings/public-profile", cta: "Set link" });
    if (usesSms && !r.smsEnabled && (!usesEmail || !r.emailEnabled)) {
        blockers.push({ title: usesEmail ? "Text and email sending are both off" : "Text sending is off, so this campaign sends nothing", href: "/automations", cta: "Turn on" });
    } else if (usesSms && !r.smsEnabled) {
        blockers.push({ title: "Text sending is off, so only emails go out", href: "/automations", cta: "Turn on" });
    } else if (usesEmail && !r.emailEnabled) {
        blockers.push({ title: usesSms ? "Email sending is off, so only texts go out" : "Email sending is off, so this campaign sends nothing", href: "/automations", cta: "Turn on" });
    }
    return blockers;
}
