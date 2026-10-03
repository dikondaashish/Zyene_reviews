"use client";

import { DashboardRouteError } from "@/components/errors/dashboard-route-error";

export default function DashboardHomeError({
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
            page="dashboard-home"
            title="Something went wrong"
            description="We encountered an error while loading your dashboard data. Please try again."
        />
    );
}
