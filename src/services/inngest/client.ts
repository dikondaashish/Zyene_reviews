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

type FollowUpDispatchEvent = {
    data: {
        requestId: string;
        campaignId: string;
    };
};

type DigestDispatchEvent = {
    data: {
        organizationId: string;
        businessId: string;
        businessName: string;
    };
};

type Events = {
    "campaign/send.contact": CampaignSendEvent;
    "review/analyze.batch": AnalysisBatchEvent;
    "google/sync.reviews": SyncGoogleReviewsEvent;
    "review/sync.platform": SyncPlatformEvent;
    "campaign/follow-up.dispatch": FollowUpDispatchEvent;
    "business/digest.dispatch": DigestDispatchEvent;
};

// Create a client to send and receive events
export const inngest = new Inngest({
    id: "zyene-reviews",
    // Providing strict types for our events
    schemas: new EventSchemas().fromRecord<Events>()
});
