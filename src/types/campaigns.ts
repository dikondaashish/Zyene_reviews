import type { LucideIcon } from "lucide-react";

export interface CampaignTemplateDefaults {
    name: string;
    channel: "sms" | "email" | "both";
    trigger_type: "manual_batch" | "scheduled";
    sms_template: string;
    email_subject: string;
    email_template: string;
    delay_minutes: number;
    follow_up_enabled: boolean;
    follow_up_delay_hours: number;
    follow_up_template: string;
}

export interface CampaignTemplate {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string;
    /** Business types this template is written for; empty or absent means it suits any business. */
    businessTypes?: readonly string[];
    defaultValues: CampaignTemplateDefaults;
}
