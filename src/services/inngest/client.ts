/** Inngest client with typed event schemas for async job orchestration. */
import { Inngest, EventSchemas } from "inngest";


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

type TrialNurtureStartEvent = {
    data: {
        email: string;
        userName: string;
        dashboardUrl: string;
        userId?: string;
        organizationId?: string;
    };
};

type OnboardingDripStartEvent = {
    data: {
        email: string;
        userName: string;
        dashboardUrl: string;
        billingUrl: string;
        organizationId: string;
    };
};

type WinbackStartEvent = {
    data: {
        email: string;
        userName: string;
        rejoinUrl: string;
        organizationId?: string;
    };
};

type MarketingNurtureStartEvent = {
    data: {
        email: string;
    };
};

/**
 * E-7 sampling. The parent plans and fans out; one child runs each unit.
 *
 * Per-unit children rather than one function looping every prompt x engine:
 * retry isolation is then per dispatch, and the granularity matches the
 * idempotency key exactly, so one poisoned engine cannot force a whole run to
 * be re-attempted — which for a paid engine would mean re-paying for the units
 * that already succeeded.
 */
type AeoRunRequestedEvent = {
    data: {
        businessId: string;
        organizationId: string;
        trigger: "scheduled" | "manual" | "backfill";
        /** The E-10 slot this run came from, for smoothing audits. */
        scheduledFor?: string;
        engineIds?: string[];
        attemptsPerPrompt?: number;
        /** Recorded before the first billable call, never inferred after. */
        overageAuthorised?: boolean;
    };
};

type AeoDispatchRequestedEvent = {
    data: {
        runId: string;
        businessId: string;
        organizationId: string;
        promptId: string;
        promptText: string;
        engineId: string;
        attempt: number;
        locale: { country: string; language: string; city?: string };
        usageDate: string;
        overageAuthorised: boolean;
        requestedUnits: number;
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
    "growth/trial-nurture.start": TrialNurtureStartEvent;
    "growth/onboarding-drip.start": OnboardingDripStartEvent;
    "growth/winback.start": WinbackStartEvent;
    "growth/marketing-nurture.start": MarketingNurtureStartEvent;
    "aeo/run.requested": AeoRunRequestedEvent;
    "aeo/dispatch.requested": AeoDispatchRequestedEvent;
};

// Create a client to send and receive events
export const inngest = new Inngest({
    id: "zyene-reviews",
    eventKey: process.env.INNGEST_EVENT_KEY,
    // Providing strict types for our events
    schemas: new EventSchemas().fromRecord<Events>()
});
