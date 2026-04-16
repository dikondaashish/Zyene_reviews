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

type Events = {
    "campaign/send.contact": CampaignSendEvent;
    "review/analyze.batch": AnalysisBatchEvent;
    "google/sync.reviews": SyncGoogleReviewsEvent;
    "review/sync.platform": SyncPlatformEvent;
    "cron/weekly-digest.business": WeeklyDigestEvent;
    "cron/follow-up.campaign": FollowUpEvent;
    "review/auto-reply": AutoReplyEvent;
    "cron/google-performance.run": CronGooglePerformanceRunEvent;
};

// Create a client to send and receive events
export const inngest = new Inngest({
    id: "zyene-reviews",
    eventKey: process.env.INNGEST_EVENT_KEY,
    // Providing strict types for our events
    schemas: new EventSchemas().fromRecord<Events>()
});
