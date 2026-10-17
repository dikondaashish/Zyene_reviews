import * as z from "zod";
import { MAX_REVIEW_REQUEST_DELAY_MINUTES } from "@/lib/review-requests/pos-send-timing";

export const reviewSettingsSchema = z.object({
    review_request_delay_minutes: z
        .number()
        .int("Whole minutes only")
        .min(0)
        .max(MAX_REVIEW_REQUEST_DELAY_MINUTES, "Maximum is 7 days (10080 minutes)"),
    review_request_min_amount_cents: z.number().min(0),
    review_request_frequency_cap_days: z.number().min(1),
    review_request_sms_enabled: z.boolean(),
    review_request_email_enabled: z.boolean(),
});

export type ReviewSettingsValues = z.infer<typeof reviewSettingsSchema>;
