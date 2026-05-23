import * as z from "zod";

export const reviewSettingsSchema = z.object({
    review_request_delay_minutes: z.number().min(0),
    review_request_min_amount_cents: z.number().min(0),
    review_request_frequency_cap_days: z.number().min(1),
    review_request_sms_enabled: z.boolean(),
    review_request_email_enabled: z.boolean(),
});

export type ReviewSettingsValues = z.infer<typeof reviewSettingsSchema>;
