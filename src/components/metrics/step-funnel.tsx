import { ArrowDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatPct, funnelSteps, type FunnelStepInput } from "@/lib/metrics/funnel-steps";

export type StepFunnelStage = FunnelStepInput & { icon?: LucideIcon; hint?: string };

/**
 * Stages as bars, widest first, with the share that moved on printed on the
 * arrow between them, so the biggest drop-off is the thing the eye lands on.
 */
export function StepFunnel({ stages, label }: { stages: StepFunnelStage[]; label: string }) {
    const steps = funnelSteps(stages);
    return (
        <ol aria-label={label} className="space-y-1">
            {steps.map((step, i) => {
                const Icon = stages[i].icon;
                return (
                    <li key={step.key}>
                        {i > 0 ? (
                            <p className="flex items-center gap-1.5 py-1 pl-1 text-xs text-muted-foreground">
                                <ArrowDown className="size-3.5" aria-hidden />
                                {step.pctOfPrev !== null ? (
                                    <span>
                                        <span className="font-semibold text-foreground">{formatPct(step.pctOfPrev)}</span> made it to this step
                                    </span>
                                ) : null}
                            </p>
                        ) : null}
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="flex min-w-0 items-center gap-2 font-medium">
                                {Icon ? <Icon className="size-4 shrink-0 text-primary" aria-hidden /> : null}
                                <span className="truncate">{step.label}</span>
                            </span>
                            <span className="shrink-0 tabular-nums">
                                <span className="font-semibold">{step.value.toLocaleString("en-US")}</span>
                                {i > 0 && steps[0].value > 0 ? (
                                    <span className="ml-1.5 text-xs text-muted-foreground">{formatPct(step.pctOfFirst)}</span>
                                ) : null}
                            </span>
                        </div>
                        <div aria-hidden className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${step.value > 0 ? Math.max(step.pctOfFirst, 1.5) : 0}%`, opacity: 1 - i * 0.12 }}
                            />
                        </div>
                        {stages[i].hint ? <p className="mt-1 text-xs text-muted-foreground">{stages[i].hint}</p> : null}
                    </li>
                );
            })}
        </ol>
    );
}
