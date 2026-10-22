import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuotaMeterResult } from "@/services/aeo/billing/quota-meter";

function usd(microUsd: number): string {
    return `$${(microUsd / 1_000_000).toFixed(2)}`;
}

/** F4.9: prompts x engines x cadence vs. plan allowance - see quota-meter.ts for the cadence caveat. */
export function QuotaMeterPanel({ meter }: { meter: QuotaMeterResult }) {
    const allowance = meter.allowanceMicroUsd;
    const over = meter.projectedExceedsAllowance === true;
    const fill = allowance && allowance > 0 ? Math.min(100, (meter.projectedMonthlyMicroUsd / allowance) * 100) : null;

    return (
        <div className="space-y-3 text-sm">
            <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3">
                    <span className="text-muted-foreground">Projected this month</span>
                    <span>
                        <span className={cn("font-semibold", over && "text-destructive")}>{usd(meter.projectedMonthlyMicroUsd)}</span>
                        {allowance !== null ? <span className="text-muted-foreground"> of {usd(allowance)} plan credit</span> : null}
                    </span>
                </div>
                {fill !== null ? (
                    <div
                        role="meter"
                        aria-label="Projected cost against plan credit"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(fill)}
                        className="h-2.5 w-full overflow-hidden rounded-full bg-secondary"
                    >
                        <div className={cn("h-full rounded-full", over ? "bg-destructive" : fill >= 80 ? "bg-warning" : "bg-success")} style={{ width: `${fill}%` }} />
                    </div>
                ) : null}
            </div>
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Questions × AI engines</span>
                <span className="font-medium">
                    {meter.activePrompts} × {meter.runnableEngines} = {meter.dispatchUnitsPerRun} per check
                </span>
            </div>
            {meter.balanceMicroUsd !== null && (
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Balance available</span>
                    <span className="font-medium">{usd(meter.balanceMicroUsd)}</span>
                </div>
            )}
            {over && (
                <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <span>Over your plan credit: checks pause when the balance runs out. Add balance, or turn off some questions or engines.</span>
                </div>
            )}
            <p className="text-xs text-muted-foreground pt-1">Estimate assumes a weekly check of every active question on every engine.</p>
        </div>
    );
}
