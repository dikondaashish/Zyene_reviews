import { serve } from "inngest/next";
import { inngest } from "@/services/inngest/client";
import { processCampaignContact, processReviewAnalysisBatch, syncGoogleReviews } from "@/services/inngest/functions";
import { syncPlatformWorker } from "@/services/inngest/sync-worker";

// Create an API that serves zero-downtime background jobs
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        processCampaignContact,
        processReviewAnalysisBatch,
        syncGoogleReviews,
        syncPlatformWorker,
    ],
});
