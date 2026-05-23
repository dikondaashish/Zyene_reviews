import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface AnimatedReviewCardShellProps {
    shellTitle: string;
    shellSubtitle?: string;
    manageAllHref?: string;
    manageAllLabel?: string;
    className?: string;
    topNav: ReactNode;
    children: ReactNode;
}

export function AnimatedReviewCardShell({
    shellTitle,
    shellSubtitle,
    manageAllHref,
    manageAllLabel,
    className,
    topNav,
    children,
}: AnimatedReviewCardShellProps) {
    return (
        <div className={cn("flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5 md:p-6", className)}>
            <div className="mb-2 flex shrink-0 flex-col gap-2.5 border-b border-border/60 pb-3 sm:gap-3 sm:pb-4">
                <div className="min-w-0 space-y-0.5">
                    <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">{shellTitle}</h2>
                    {shellSubtitle ? (
                        <p className="text-xs leading-snug text-muted-foreground sm:text-sm">{shellSubtitle}</p>
                    ) : null}
                </div>
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    {topNav}
                    {manageAllHref && manageAllLabel ? (
                        <Link
                            href={manageAllHref}
                            className="shrink-0 text-xs font-medium text-primary hover:underline"
                        >
                            {manageAllLabel}
                        </Link>
                    ) : null}
                </div>
            </div>
            <div className="min-w-0 flex-1 pt-1 sm:pt-2">{children}</div>
        </div>
    );
}
