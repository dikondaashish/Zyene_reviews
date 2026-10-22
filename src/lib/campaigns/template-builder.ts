import type { LucideIcon } from "lucide-react";
import type { CampaignTemplate, CampaignTemplateDefaults } from "@/types/campaigns";
import type { BusinessType } from "@/lib/campaigns/business-types";

type TemplateSpec = {
    id: string;
    name: string;
    description: string;
    /** Empty means the template suits any business. */
    businessTypes: BusinessType[];
    icon: LucideIcon;
    color?: string;
    channel: CampaignTemplateDefaults["channel"];
    delayMinutes: number;
    sms: string;
    emailSubject: string;
    /** Short plain paragraphs; the greeting, link and sign-off are added around them. */
    emailParagraphs: string[];
    /** One line after the link, e.g. inviting criticism as well as praise. */
    closing: string;
    reminder: string;
    reminderDelayHours: number;
    /** Defaults to on. */
    remindersOn?: boolean;
};

const COLOR = "text-primary bg-primary/10 border-primary/20";

/**
 * Review requests are written to read like a note from the owner, because
 * Gmail and Outlook sort on how a message looks as much as who sent it:
 * plain text (no HTML, buttons or images), a single visible link, a short
 * conversational subject, no sales words. That keeps them out of Promotions
 * and Other as far as wording can; sender reputation and engagement do the rest.
 * Every message asks for honest feedback and offers nothing in return, which
 * Google's review policy requires.
 */
export function buildTemplate(spec: TemplateSpec): CampaignTemplate {
    const email = [
        "Hi {first_name},",
        ...spec.emailParagraphs,
        "{review_link}",
        spec.closing,
        "Thank you,\n{business_name}",
    ].join("\n\n");
    return {
        id: spec.id,
        name: spec.name,
        description: spec.description,
        icon: spec.icon,
        color: spec.color ?? COLOR,
        businessTypes: spec.businessTypes,
        defaultValues: {
            name: spec.name,
            channel: spec.channel,
            trigger_type: "manual_batch",
            sms_template: spec.sms,
            email_subject: spec.emailSubject,
            email_template: email,
            delay_minutes: spec.delayMinutes,
            follow_up_enabled: spec.remindersOn ?? true,
            follow_up_delay_hours: spec.reminderDelayHours,
            follow_up_template: spec.reminder,
        },
    };
}
