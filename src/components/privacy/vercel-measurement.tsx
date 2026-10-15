"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { analyticsExplicitlyRejected } from "@/lib/privacy/privacy-store";

/**
 * Vercel Web Analytics + Speed Insights (cookieless: no cookies, localStorage
 * or cross-site identifiers; visitors are counted with a daily-rotating
 * server-side hash). Because nothing is stored on the device they run before a
 * choice, but once a visitor explicitly rejects analytics every event is
 * dropped client-side via `beforeSend`.
 */
const dropIfRejected = <T,>(event: T): T | null => (analyticsExplicitlyRejected() ? null : event);

export function VercelMeasurement() {
    return (
        <>
            <Analytics beforeSend={dropIfRejected} />
            <SpeedInsights beforeSend={dropIfRejected} />
        </>
    );
}
