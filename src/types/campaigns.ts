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
    defaultValues: CampaignTemplateDefaults;
}
