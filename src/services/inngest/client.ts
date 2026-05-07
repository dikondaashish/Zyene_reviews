import { Inngest, EventSchemas } from "inngest";

// Define the payload for the campaign send event
type CampaignSendEvent = {
    data: {
        campaignId: string;
        businessId: string;
        contact: {
            name?: string;
            phone?: string;
            email?: string;
        };
    };
};

type AnalysisBatchEvent = {
    data: {
        reviewIds: string[];
    };
};

type SyncGoogleReviewsEvent = {
    data: {
        platformId: string;
    };
};

type SyncPlatformEvent = {
    data: {
        platformId: string;
        platformType: "google" | "yelp" | "facebook";
        /** When set (e.g. Pub/Sub review webhook), identifies the GBP location that triggered the sync. */
        googleLocationId?: string;
        /**
         * `pubsub` — worker may wait and retry on Google sync lock conflict (see sync-platform-worker).
         * Omitted for cron/manual fan-out (unchanged behavior).
         */
        triggerSource?: "pubsub";
    };
};

type WeeklyDigestEvent = {
    data: {
        businessId: string;
    };
};

type FollowUpEvent = {
    data: {
        campaignId: string;
    };
};

type AutoReplyEvent = {
    data: {
        reviewId: string;
    };
};

type CronGooglePerformanceRunEvent = {
    data: {
        trigger: "cron-jobs.org" | "manual" | "api";
    };
};

type GoogleSeoAeoAiVisibilityRunEvent = {
    data: {
        businessId: string;
        query: string;
    };
};

type GoogleSeoAeoHeatmapRunEvent = {
    data: {
        businessId: string;
        keyword: string;
    };
};

type GoogleSeoAeoSyncRunEvent = {
    data: {
        businessId: string;
        trigger: "manual" | "onboarding";
    };
};

type ScheduledReviewRequestSendEvent = {
    data: {
        reviewRequestId: string;
        /** ISO timestamp when send should happen. */
        sendAt: string;
        /** For debugging/attribution (optional). */
        trigger?: "api" | "supabase-webhook";
    };
};

type Events = {
    "campaign/send.contact": CampaignSendEvent;
    "review/analyze.batch": AnalysisBatchEvent;
    "google/sync.reviews": SyncGoogleReviewsEvent;
    "review/sync.platform": SyncPlatformEvent;
    "cron/weekly-digest.business": WeeklyDigestEvent;
    "cron/follow-up.campaign": FollowUpEvent;
    "review/auto-reply": AutoReplyEvent;
    "cron/google-performance.run": CronGooglePerformanceRunEvent;
    "google-seo-aeo/ai-visibility.run": GoogleSeoAeoAiVisibilityRunEvent;
    "google-seo-aeo/heatmap.run": GoogleSeoAeoHeatmapRunEvent;
    "google-seo-aeo/sync.run": GoogleSeoAeoSyncRunEvent;
    "review-request/scheduled.send": ScheduledReviewRequestSendEvent;
};

// Create a client to send and receive events
export const inngest = new Inngest({
    id: "zyene-reviews",
    eventKey: process.env.INNGEST_EVENT_KEY,
    // Providing strict types for our events
    schemas: new EventSchemas().fromRecord<Events>()
});
