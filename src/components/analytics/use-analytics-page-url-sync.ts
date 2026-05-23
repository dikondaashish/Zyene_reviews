"use client";

import { useEffect } from "react";
import type { AnalyticsRange } from "@/lib/analytics/date-range";

export function useAnalyticsPageUrlSync(range: AnalyticsRange, platform: string) {
    useEffect(() => {
        const params = new URLSearchParams();
        if (range !== "30d") params.set("range", range);
        if (platform !== "all") params.set("platform", platform);
        const qs = params.toString();
        const path = qs ? `/analytics?${qs}` : "/analytics";
        window.history.replaceState(null, "", path);
    }, [range, platform]);
}
