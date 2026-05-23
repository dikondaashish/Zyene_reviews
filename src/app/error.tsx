"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function RootError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to Sentry automatically
        Sentry.captureException(error);
    }, [error]);

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 p-8 text-center bg-muted/40">
            <div className="rounded-full bg-destructive/15 p-4">
                <AlertTriangle className="text-destructive size-10" />
            </div>

            <div className="space-y-3 max-w-md">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Application Error
                </h1>
                <p className="text-base text-muted-foreground">
                    We encountered an unexpected error. Our team has been automatically notified and is looking into it.
                </p>
                {/* Only show digest in development or to admins if needed, hiding for now for clean UX */}
            </div>

            <div className="flex gap-4 mt-4">
                <Button onClick={() => reset()} variant="default" className="gap-2">
                    <RefreshCw className="size-4" />
                    Try again
                </Button>
                <Link href="/">
                    <Button variant="outline" className="gap-2">
                        <Home className="size-4" />
                        Go home
                    </Button>
                </Link>
            </div>
        </div>
    );
}
