import { z } from "zod";

export const patchCampaignSchema = z.object({
    name: z.string().min(1).max(150).optional(),
    status: z.enum(["draft", "active", "paused", "processing", "completed", "archived"]).optional(),
    trigger_type: z.string().max(50).optional(),
    channel: z.enum(["sms", "email", "both"]).optional(),
    sms_template: z.string().max(5000).optional(),
    email_subject: z.string().max(255).optional(),
    email_template: z.string().max(20000).optional(),
    delay_minutes: z.number().int().min(0).max(7 * 24 * 60).optional(),
    follow_up_enabled: z.boolean().optional(),
    follow_up_delay_hours: z.number().int().min(0).max(30 * 24).optional(),
    follow_up_template: z.string().max(5000).optional(),
    drip_step3_template: z.string().max(5000).optional().nullable(),
}).superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "No valid fields to update",
        });
    }
});
