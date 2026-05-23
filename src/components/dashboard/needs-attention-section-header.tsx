import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NeedsAttentionCopy } from "@/components/dashboard/needs-attention-types";
import { subtitleFor } from "@/components/dashboard/needs-attention-default-copy";

export function NeedsAttentionSectionHeader({
    copy,
    viewAllHref,
    urgentCount,
}: {
    copy: NeedsAttentionCopy;
    viewAllHref?: string;
    urgentCount: number;
}) {
    return (
        <div className="flex flex-col gap-2 border-b border-border bg-chart-4/25 px-4 py-3.5 dark:bg-chart-4/15 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5 sm:py-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <AlertTriangle className="size-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold tracking-tight text-foreground">{copy.title}</p>
                    <p className="text-[11.5px] leading-snug text-muted-foreground">{subtitleFor(copy, urgentCount)}</p>
                </div>
            </div>
            {viewAllHref ? (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 shrink-0 self-start px-2 text-[13px] sm:self-center"
                    asChild
                >
                    <Link href={viewAllHref}>{copy.viewAll}</Link>
                </Button>
            ) : null}
        </div>
    );
}
