import { z } from "zod";

export const createCampaignSchema = z.object({
    name: z.string().min(1).max(255),
    status: z.enum(["active", "paused", "draft"]).default("draft"),
    trigger_type: z.enum(["manual_batch", "scheduled", "pos_payment"]).default("manual_batch"),
    channel: z.enum(["sms", "email", "both"]).default("sms"),
    sms_template: z.string().optional(),
    email_subject: z.string().max(255).optional(),
    email_template: z.string().optional(),
    delay_minutes: z.number().int().min(0).default(0),
    follow_up_enabled: z.boolean().default(false),
    follow_up_delay_hours: z.number().int().min(1).default(48),
    follow_up_template: z.string().optional(),
});

export const campaignSendSchema = z.object({
    contacts: z.array(
        z.object({
            name: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().email().optional(),
        })
    ).min(1).max(500),
});
