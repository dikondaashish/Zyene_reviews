import Link from "next/link";
import { ArrowRight, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AutomationsOverview } from "@/services/automations/load-automations-overview";
import { getAutomationStatus, type AutomationStatus } from "./automation-status";

const TONE_DOT: Record<AutomationStatus["tone"], string> = {
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
    muted: "bg-muted-foreground/50",
};

const TONE_PILL: Record<AutomationStatus["tone"], string> = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
};

/** Status first, then every item that needs a person, each with its own button. */
export function AutomationsStatusPanel({ overview }: { overview: AutomationsOverview }) {
    const status = getAutomationStatus(overview);
    const isIdle = status.tone === "muted";

    return (
        <section aria-labelledby="automation-status-title" className="overflow-hidden rounded-xl border bg-card">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">Automation status</p>
                    <div className="mt-1.5 flex items-center gap-2.5">
                        <span className={cn("size-2.5 shrink-0 rounded-full", TONE_DOT[status.tone])} aria-hidden />
                        <h2 id="automation-status-title" className="text-xl font-semibold tracking-tight text-foreground">
                            {status.label}
                        </h2>
                    </div>
                    <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">{status.summary}</p>
                </div>
                {isIdle ? (
                    <Button asChild className="self-start sm:self-center">
                        <Link href="/campaigns">
                            Start a campaign <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                ) : (
                    <span className={cn("self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-center", TONE_PILL[status.tone])}>
                        {overview.actions.length === 0 ? "All good" : `${overview.actions.length} to check`}
                    </span>
                )}
            </div>

            {overview.actions.length > 0 ? (
                <ul className="divide-y divide-border border-t border-border bg-muted/25" aria-label="Needs your attention">
                    {overview.actions.map((action) => (
                        <li
                            key={action.title}
                            className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                        >
                            <p className="flex items-start gap-2.5 text-sm font-medium text-foreground">
                                <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning-foreground" aria-hidden />
                                {action.title}
                            </p>
                            <Button asChild size="sm" variant="outline" className="self-start sm:self-auto">
                                <Link href={action.href}>
                                    Open <ArrowRight className="size-3.5" />
                                </Link>
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : null}
        </section>
    );
}
