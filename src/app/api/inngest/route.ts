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
import { aeoYearlyCreditResetWorker } from "@/services/inngest/aeo/aeo-yearly-credit-reset-worker";
import { aeoCrawlWorker } from "@/services/inngest/aeo/aeo-crawl-worker";
import { aeoAlertWorker } from "@/services/inngest/aeo/aeo-alert-worker";
import { aeoAlertDigestWorker } from "@/services/inngest/aeo/aeo-alert-digest-worker";

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
        // E-9.1: refuses to run unless AEO_METERED_BILLING_LIVE is exactly
        // "true", so registering it here does not by itself grant credit.
        aeoYearlyCreditResetWorker,
        // E-3: refuses to run unless AEO_LIVE_CRAWLING is exactly "true", so
        // registering it here does not by itself crawl anyone's site. Nothing
        // sends aeo/crawl.requested yet either — see aeo-crawl-scheduler/route.ts.
        aeoCrawlWorker,
        // F8: both refuse to run unless AEO_LIVE_ALERTING is exactly "true", so
        // registering them here does not by itself alert or email anyone.
        // Nothing sends either event yet — see aeo-alert-scheduler/route.ts and
        // aeo-alert-digest/route.ts.
        aeoAlertWorker,
        aeoAlertDigestWorker,
    ],
    servePath: "/api/inngest",
    ...(serveHost ? { serveHost } : {}),
    ...(process.env.INNGEST_SIGNING_KEY ? { signingKey: process.env.INNGEST_SIGNING_KEY } : {}),
});
