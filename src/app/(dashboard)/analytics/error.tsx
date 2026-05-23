"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function AnalyticsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
    }, [error]);

    return (
        <div className="flex h-[calc(100vh-8rem)] w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center animate-in fade-in duration-500 bg-card m-6">
            <div className="rounded-full bg-destructive/15 p-3">
                <AlertCircle className="text-destructive size-8" />
            </div>
            <div className="space-y-2 max-w-sm">
                <h2 className="text-2xl font-semibold tracking-tight">
                    Failed to load analytics
                </h2>
                <p className="text-sm text-muted-foreground">
                    We could not process the analytics data. Please try reloading the page.
                </p>
            </div>
            <Button onClick={() => reset()} className="gap-2 mt-2">
                <RefreshCw className="size-4" />
                Try again
            </Button>
        </div>
    );
}
