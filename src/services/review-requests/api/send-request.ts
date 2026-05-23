import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import * as Sentry from "@sentry/nextjs";
import { requestRateLimit } from "@/lib/auth/rate-limit";
import { apiError } from "@/app/api/_shared/responses";
import { executeSendReviewRequest } from "./send-request-execute";
import { sendRequestSchema } from "./send-request-schema";

export async function handleSendReviewRequest(request: Request) {
    try {
        const supabase = await createClient();
        const admindClient = createAdminClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return apiError("Unauthorized", { status: 401 });
        }

        const { success: rateLimitSuccess } = await requestRateLimit.limit(user.id);
        if (!rateLimitSuccess) {
            return apiError("Rate limit exceeded. Try again later.", { status: 429 });
        }

        const parsed = sendRequestSchema.safeParse(await request.json());
        if (!parsed.success) {
            return apiError(parsed.error.issues[0]?.message || "Invalid request", { status: 400 });
        }

        const { customerName, customerPhone, customerEmail, channel: channelRaw, businessId, scheduledFor } =
            parsed.data;

        return executeSendReviewRequest({
            supabase,
            admindClient,
            user,
            customerName,
            customerPhone,
            customerEmail,
            channel: channelRaw.toLowerCase(),
            businessId,
            scheduledFor,
        });
    } catch (error: unknown) {
        logger.error({ err: error }, "Request API Error:");
        Sentry.captureException(error, { tags: { route: "requests-send" } });
        return apiError("An unexpected error occurred. Please try again.", { status: 500 });
    }
}
