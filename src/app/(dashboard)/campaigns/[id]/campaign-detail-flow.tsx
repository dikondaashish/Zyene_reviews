import Link from "next/link";
import { AlertCircle, CircleCheck, Clock, Send, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildCampaignFlow, campaignSendBlockers, type CampaignFlowStep } from "@/lib/campaigns/campaign-flow";
import type { Campaign } from "./campaign-detail-types";

const ICON = { start: UserPlus, wait: Clock, send: Send } as const;

function FlowNode({ step }: { step: CampaignFlowStep }) {
    const Icon = ICON[step.kind];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                step.kind === "wait" ? "border-dashed bg-muted/40 text-muted-foreground" : "bg-card text-foreground",
            )}
        >
            <Icon className={cn("size-4 shrink-0", step.kind === "send" ? "text-primary" : step.kind === "start" ? "text-success" : "")} aria-hidden />
            <span className="font-medium">{step.label}</span>
            {step.kind === "send" && <span className="text-xs text-muted-foreground">· {step.detail}</span>}
        </span>
    );
}

/** What happens to each customer, step by step, with anything that would stop it shown first. */
export function CampaignDetailFlow({ campaign }: { campaign: Campaign }) {
    const steps = buildCampaignFlow(campaign);
    const blockers = campaign.sendReadiness ? campaignSendBlockers(campaign, campaign.sendReadiness) : [];
    const paused = campaign.status !== "active";
    return (
        <section aria-labelledby="campaign-flow-title" className="rounded-xl border bg-card p-5 sm:p-6">
            <h2 id="campaign-flow-title" className="ui-section-title">How this campaign works</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                {campaign.follow_up_enabled
                    ? "Reminders stop as soon as the customer acts, so nobody is asked more than three times."
                    : "One message per customer. Turn on reminders in the campaign settings to follow up."}
            </p>

            {blockers.length > 0 && (
                <ul className="mt-4 space-y-2" aria-label="Problems to fix before messages go out">
                    {blockers.map((b) => (
                        <li key={b.title} className="flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-sm">
                            <span className="flex items-center gap-2 text-destructive">
                                <AlertCircle className="size-4 shrink-0" aria-hidden />{b.title}
                            </span>
                            <Button asChild size="sm" variant="outline" className="shrink-0"><Link href={b.href}>{b.cta}</Link></Button>
                        </li>
                    ))}
                </ul>
            )}
            {paused && blockers.length === 0 && (
                <p className="mt-4 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
                    This campaign is {campaign.status === "draft" ? "a draft" : "paused"}. Nothing is sent until you turn it on.
                </p>
            )}

            <ol className="mt-5 flex flex-col items-center gap-0 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-5" aria-label="Campaign steps">
                {steps.map((step, i) => (
                    <li key={`${step.kind}-${i}`} className="flex flex-col items-center">
                        {i > 0 && <span className="h-4 w-px bg-border" aria-hidden />}
                        <FlowNode step={step} />
                    </li>
                ))}
                <li className="flex flex-col items-center">
                    <span className="h-4 w-px bg-border" aria-hidden />
                    <span className="flex items-center gap-2 text-sm text-success">
                        <CircleCheck className="size-4 fill-success text-card" aria-hidden />Customer reviews you
                    </span>
                </li>
            </ol>
        </section>
    );
}
