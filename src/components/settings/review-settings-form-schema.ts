import * as z from "zod";
import { MAX_REVIEW_REQUEST_DELAY_MINUTES } from "@/lib/review-requests/pos-send-timing";

export const reviewSettingsSchema = z.object({
    review_request_delay_minutes: z
        .number()
        .int("Whole minutes only")
        .min(0)
        .max(MAX_REVIEW_REQUEST_DELAY_MINUTES, "Maximum is 7 days (10080 minutes)"),
    review_request_min_amount_cents: z.number().min(0),
    review_request_frequency_cap_days: z.number().int("Whole days only").min(1).max(365, "Maximum is 365 days"),
    review_request_sms_enabled: z.boolean(),
    review_request_email_enabled: z.boolean(),
    review_request_quiet_hours_enabled: z.boolean(),
    review_request_quiet_start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM"),
    review_request_quiet_end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM"),
}).refine((v) => !v.review_request_quiet_hours_enabled || v.review_request_quiet_start !== v.review_request_quiet_end, {
    message: "Start and end must differ",
    path: ["review_request_quiet_end"],
});

export type ReviewSettingsValues = z.infer<typeof reviewSettingsSchema>;
