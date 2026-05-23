import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { LoadDashboardPageDataResult } from "./types";
import { loadDashboardAuth } from "./load-dashboard-auth";
import {
    buildDashboardPageDataResult,
    loadDashboardGoogle,
} from "./load-dashboard-google";
import { loadDashboardStats } from "./load-dashboard-stats";

export async function loadDashboardPageData(dict: Dictionary): Promise<LoadDashboardPageDataResult> {
    const auth = await loadDashboardAuth();

    const statsResult = await loadDashboardStats(auth);
    if (statsResult.errorElement) {
        return { errorElement: statsResult.errorElement };
    }

    const googleResult = await loadDashboardGoogle({
        auth,
        stats: statsResult.stats,
        visibleReviewRollup: statsResult.visibleReviewRollup,
        dict,
    });
    if ("errorElement" in googleResult) {
        return { errorElement: googleResult.errorElement };
    }

    return buildDashboardPageDataResult(
        auth,
        statsResult.stats,
        googleResult.google,
        dict,
    );
}
