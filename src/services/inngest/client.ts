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

type Events = {
    "campaign/send.contact": CampaignSendEvent;
    "review/analyze.batch": AnalysisBatchEvent;
};

// Create a client to send and receive events
export const inngest = new Inngest({
    id: "zyene-reviews",
    // Providing strict types for our events
    schemas: new EventSchemas().fromRecord<Events>()
});
