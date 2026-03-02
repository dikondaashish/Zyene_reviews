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

type Events = {
    "campaign/send.contact": CampaignSendEvent;
};

// Create a client to send and receive events
export const inngest = new Inngest({
    id: "zyene-reviews",
    // Providing strict types for our events
    schemas: new EventSchemas().fromRecord<Events>()
});
