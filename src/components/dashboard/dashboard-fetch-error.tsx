import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

type DashboardFetchErrorProps = {
    title?: string;
    message: string;
    onRetry?: () => void;
    /** For server-rendered pages: full-page refresh via navigation */
    retryHref?: string;
    retryLabel?: string;
};

/**
 * Inline error surface for server or client data-fetch failures (Phase 2 follow-up / Phase 3).
 */
export function DashboardFetchError({
    title = "Something went wrong",
    message,
    onRetry,
    retryHref,
    retryLabel = "Try again",
}: DashboardFetchErrorProps) {
    return (
        <div
            className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card px-6 py-10 text-center"
            role="alert"
        >
            <div className="flex items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 size-12">
                <AlertTriangle className="text-destructive size-6" aria-hidden />
            </div>
            <div className="space-y-1 max-w-md">
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
            </div>
            {onRetry ? (
                <Button type="button" variant="outline" onClick={onRetry}>
                    {retryLabel}
                </Button>
            ) : null}
            {!onRetry && retryHref ? (
                <Button variant="outline" asChild>
                    <Link href={retryHref}>{retryLabel}</Link>
                </Button>
            ) : null}
        </div>
    );
}
