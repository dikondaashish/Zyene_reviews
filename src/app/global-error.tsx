"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
                    <h1 className="text-3xl font-bold">Something went wrong</h1>
                    <p className="max-w-md text-muted-foreground">
                        We have been notified. Please refresh the page or try again in a moment.
                    </p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        Refresh page
                    </button>
                </main>
            </body>
        </html>
    );
}
