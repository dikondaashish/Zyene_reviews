"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

import { Button } from "@/components/ui/button";

type DashboardRouteErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
    page: string;
    title: string;
    description: string;
};

/**
 * Shared dashboard segment error UI + Sentry capture.
 * Route `error.tsx` files pass page-specific copy; capture stays consistent.
 */
export function DashboardRouteError({
    error,
    reset,
    page,
    title,
    description,
}: DashboardRouteErrorProps) {
    useEffect(() => {
        Sentry.captureException(error, { tags: { page, surface: "dashboard" } });
    }, [error, page]);

    return (
        <div className="m-6 flex h-[calc(100vh-8rem)] w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-card p-8 text-center">
            <div className="rounded-full bg-destructive/15 p-3">
                <AlertCircle className="size-8 text-destructive" />
            </div>
            <div className="max-w-sm space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Button onClick={() => reset()} className="mt-2 gap-2">
                <RefreshCw className="size-4" />
                Try again
            </Button>
        </div>
    );
}
