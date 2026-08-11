import { AlertTriangle } from "lucide-react";
import type { QuotaMeterResult } from "@/services/aeo/billing/quota-meter";

function usd(microUsd: number): string {
    return `$${(microUsd / 1_000_000).toFixed(2)}`;
}

/** F4.9: prompts x engines x cadence vs. plan allowance — see quota-meter.ts for the cadence caveat. */
export function QuotaMeterPanel({ meter }: { meter: QuotaMeterResult }) {
    return (
        <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active prompts x engines</span>
                <span className="font-medium">
                    {meter.activePrompts} x {meter.runnableEngines} = {meter.dispatchUnitsPerRun}/run
                </span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Projected monthly cost</span>
                <span className="font-medium">{usd(meter.projectedMonthlyMicroUsd)}</span>
            </div>
            {meter.allowanceMicroUsd !== null && (
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Plan allowance</span>
                    <span className="font-medium">{usd(meter.allowanceMicroUsd)}/mo</span>
                </div>
            )}
            {meter.balanceMicroUsd !== null && (
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Remaining this cycle</span>
                    <span className="font-medium">{usd(meter.balanceMicroUsd)}</span>
                </div>
            )}
            {meter.projectedExceedsAllowance && (
                <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <span>
                        Projected to exceed your plan&apos;s monthly allowance. The difference bills
                        as metered overage once enabled.
                    </span>
                </div>
            )}
            <p className="text-xs text-muted-foreground pt-1">
                Based on the current weekly sampling cadence for every plan — the scheduler does not
                yet run Professional daily.
            </p>
        </div>
    );
}
