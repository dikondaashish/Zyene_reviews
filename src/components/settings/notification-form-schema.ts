import * as z from "zod";

export const notificationFormSchema = z.object({
    sms_enabled: z.boolean(),
    phone_number: z.string().optional(),
    email_enabled: z.boolean(),
    digest_enabled: z.boolean(),
    min_urgency_score: z.string(),
    quiet_hours_start: z.string().optional(),
    quiet_hours_end: z.string().optional(),
});

export type NotificationFormValues = z.infer<typeof notificationFormSchema>;
