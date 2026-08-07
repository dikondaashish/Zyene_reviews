import { serve } from "inngest/next";
import { inngest } from "@/services/inngest/client";
import {
    processCampaignContact,
    processReviewAnalysisBatch,
    processAutoReplyReview,
    syncGoogleReviews,
    processScheduledReviewRequest,
} from "@/services/inngest/functions";
import {
    syncPlatformWorker,
    weeklyDigestWorker,
    followUpWorker,
    syncGooglePerformanceWorker,
    googleSeoAeoAiVisibilityWorker,
    googleSeoAeoHeatmapWorker,
    googleSeoAeoSyncWorker,
} from "@/services/inngest/sync-worker";
import {
    trialNurtureWorker,
    onboardingDripWorker,
    winbackWorker,
    marketingNurtureWorker,
} from "@/services/inngest/growth-functions";
import { aeoRunPlanner } from "@/services/inngest/aeo/aeo-run-planner";
import { aeoDispatchWorker } from "@/services/inngest/aeo/aeo-dispatch-worker";
import { aeoGeoGridWorker } from "@/services/inngest/aeo/aeo-geo-grid-worker";

/**
 * Inngest registers the callback URL it will use to invoke functions. On Vercel,
 * inferred host can be *.vercel.app while users browse app.example.com; deployment
 * protection bypass is often tied to the custom domain. Force the public origin
 * via INNGEST_SERVE_HOST or NEXT_PUBLIC_APP_URL (production only).
 */
function inngestServeHost(): string | undefined {
    const explicit = process.env.INNGEST_SERVE_HOST?.trim();
    if (explicit) return explicit.replace(/\/$/, "");
    if (process.env.VERCEL_ENV === "production") {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
        if (appUrl) return appUrl.replace(/\/$/, "");
    }
    return undefined;
}

const serveHost = inngestServeHost();

// Create an API that serves zero-downtime background jobs
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        processCampaignContact,
        processScheduledReviewRequest,
        processReviewAnalysisBatch,
        processAutoReplyReview,
        syncGoogleReviews,
        syncPlatformWorker,
        weeklyDigestWorker,
        followUpWorker,
        syncGooglePerformanceWorker,
        googleSeoAeoAiVisibilityWorker,
        googleSeoAeoHeatmapWorker,
        googleSeoAeoSyncWorker,
        trialNurtureWorker,
        onboardingDripWorker,
        winbackWorker,
        marketingNurtureWorker,
        // E-7 sampling. Both refuse to run unless AEO_LIVE_SAMPLING is exactly
        // "true", so registering them here does not by itself enable spending.
        aeoRunPlanner,
        aeoDispatchWorker,
        aeoGeoGridWorker,
    ],
    servePath: "/api/inngest",
    ...(serveHost ? { serveHost } : {}),
    ...(process.env.INNGEST_SIGNING_KEY ? { signingKey: process.env.INNGEST_SIGNING_KEY } : {}),
});
