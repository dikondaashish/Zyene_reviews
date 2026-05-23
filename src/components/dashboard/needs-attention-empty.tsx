import { AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NeedsAttentionCopy } from "@/components/dashboard/needs-attention-types";
import { subtitleFor } from "@/components/dashboard/needs-attention-default-copy";

export function NeedsAttentionEmpty({
    copy,
    className,
}: {
    copy: NeedsAttentionCopy;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "overflow-hidden rounded-[14px] border border-border bg-card text-card-foreground shadow-sm",
                className
            )}
        >
            <div className="border-b border-border bg-chart-4/20 px-5 py-4 dark:bg-chart-4/10">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <AlertTriangle className="h-4 w-4" aria-hidden />
                    </div>
                    <div>
                        <p className="text-[13.5px] font-semibold tracking-tight text-foreground">{copy.title}</p>
                        <p className="text-[11.5px] text-muted-foreground">{subtitleFor(copy, 0)}</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                <div className="rounded-full bg-chart-2/15 p-3 dark:bg-chart-2/10">
                    <Check className="h-6 w-6 text-chart-2" aria-hidden />
                </div>
                <p className="text-sm font-medium text-foreground">{copy.emptyTitle}</p>
                <p className="max-w-xs text-sm text-muted-foreground">{copy.emptyDescription}</p>
            </div>
        </div>
    );
}
