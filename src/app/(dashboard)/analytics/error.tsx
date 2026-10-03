"use client";

import { DashboardRouteError } from "@/components/errors/dashboard-route-error";

export default function AnalyticsError({
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
            page="analytics"
            title="Failed to load analytics"
            description="We could not process the analytics data. Please try reloading the page."
        />
    );
}
