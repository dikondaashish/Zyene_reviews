import * as z from "zod";

export const notificationFormSchema = z.object({
    sms_enabled: z.boolean(),
    phone_number: z.string().max(32).optional(),
    email_enabled: z.boolean(),
    digest_enabled: z.boolean(),
    min_urgency_score: z.string(),
    quiet_hours_start: z.string().optional(),
    quiet_hours_end: z.string().optional(),
}).refine((data) => !data.sms_enabled || /^\+[1-9]\d{7,14}$/.test((data.phone_number || "").replace(/[\s()-]/g, "")), {
    path: ["phone_number"], message: "Enter a valid phone number with country code, such as +1 212 555 0123, or turn off text alerts.",
});

export type NotificationFormValues = z.infer<typeof notificationFormSchema>;
