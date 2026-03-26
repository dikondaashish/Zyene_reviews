import { serve } from "inngest/next";
import { inngest } from "@/services/inngest/client";
import { processCampaignContact } from "@/services/inngest/functions";

// Create an API that serves zero-downtime background jobs
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        processCampaignContact,
    ],
});
