/** Pre-built campaign templates for review requests (SMS, email, drip sequences). */
import { Calendar, Zap, Users } from "lucide-react";
import type { CampaignTemplate } from "@/types/campaigns";
import { buildTemplate } from "@/lib/campaigns/template-builder";
import { HOSPITALITY_RETAIL_TEMPLATES } from "@/lib/campaigns/templates-hospitality-retail";
import { CARE_WELLNESS_TEMPLATES } from "@/lib/campaigns/templates-care-wellness";
export type { CampaignTemplate };

/** General templates that suit any business. Listed first; ids are linked from elsewhere. */
const GENERAL_TEMPLATES: CampaignTemplate[] = [
    buildTemplate({
        id: "post-visit", name: "Post-Visit Review", businessTypes: [], icon: Zap,
        color: "text-chart-5 bg-chart-5/10 border-chart-5/20",
        description: "Best for retail and restaurants. Send right after a customer leaves.",
        channel: "sms", delayMinutes: 60,
        sms: "Hi {first_name}, it's {business_name}. Thanks for coming in today. How did it go? {review_link}",
        emailSubject: "{first_name}, how did we do?",
        emailParagraphs: [
            "Thanks for coming in to {business_name}. I wanted to check in while your visit is still fresh.",
            "Would you take a minute to tell us how it went? Your words help us and help others nearby decide.",
        ],
        closing: "If anything wasn't right, please say so. We read every response.",
        reminderDelayHours: 48,
        reminder: "Hi {first_name}, {business_name} here. Got a minute to tell us how your visit went? {review_link}",
    }),
    buildTemplate({
        id: "appointment-followup", name: "Appointment Follow-up", businessTypes: [], icon: Calendar,
        description: "Perfect for services, clinics, and salons. Optimized for appointments.",
        channel: "both", delayMinutes: 120,
        sms: "Hi {first_name}, thanks for your appointment with {business_name}. How did we do? {review_link}",
        emailSubject: "{first_name}, a quick question about your appointment",
        emailParagraphs: [
            "Thank you for choosing {business_name} for your appointment.",
            "How was everything, from booking to the visit itself? A few honest words would mean a lot to our team.",
        ],
        closing: "If something could have gone better, I'd genuinely like to know.",
        reminderDelayHours: 24, remindersOn: false, reminder: "",
    }),
    buildTemplate({
        id: "re-engagement", name: "Customer Re-engagement", businessTypes: [], icon: Users,
        color: "text-sync-action bg-sync-action/10 border-sync-action/20",
        description: "Bring back customers who haven't visited in a while.",
        channel: "email", delayMinutes: 0,
        sms: "Hi {first_name}, it's {business_name}. It's been a while. How was your last visit with us? {review_link}",
        emailSubject: "{first_name}, it's been a while",
        emailParagraphs: [
            "It has been a little while since we last saw you at {business_name}, and I wanted to say thank you for coming in.",
            "If you have a minute, would you share how your last visit went? It helps us know what to keep and what to fix.",
        ],
        closing: "Either way, we'd love to see you again.",
        reminderDelayHours: 72,
        reminder: "Hi {first_name}, {business_name} here. Got a minute to share how your last visit went? {review_link}",
    }),
];

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
    ...GENERAL_TEMPLATES,
    ...HOSPITALITY_RETAIL_TEMPLATES,
    ...CARE_WELLNESS_TEMPLATES,
];
