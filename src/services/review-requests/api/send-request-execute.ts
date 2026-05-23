import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { prepareExecuteSendReviewRequest } from "./send-request-execute-prepare";
import { executeScheduledSendReviewRequest } from "./send-request-execute-scheduled";
import { executeImmediateSendReviewRequest } from "./send-request-execute-immediate";

export async function executeSendReviewRequest(params: {
    supabase: SupabaseClient;
    admindClient: SupabaseClient;
    user: User;
    customerName?: string | null;
    customerPhone?: string | null;
    customerEmail?: string | null;
    channel: string;
    businessId: string;
    scheduledFor?: string | null;
}) {
    const prepared = await prepareExecuteSendReviewRequest(params);
    if (!("businessId" in prepared)) {
        return prepared;
    }

    if (prepared.isScheduled) {
        return executeScheduledSendReviewRequest(prepared);
    }

    return executeImmediateSendReviewRequest(prepared);
}
