"use client";

import { DashboardRouteError } from "@/components/errors/dashboard-route-error";

export default function DashboardSegmentError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <DashboardRouteError
            error={error}
            reset={reset}
            page="dashboard"
            title="Something went wrong"
            description="We encountered an error while loading this page. Please try again."
        />
    );
}
