import { MessageSquare, Calendar, Zap, Mail, Users } from "lucide-react";
import type { CampaignTemplate } from "@/types/campaigns";
export type { CampaignTemplate };

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
    {
        id: "post-visit",
        name: "Post-Visit Review",
        description: "Best for retail and restaurants. Send right after a customer leaves.",
        icon: Zap,
        color: "text-orange-600 bg-orange-50 border-orange-100",
        defaultValues: {
            name: "Post-Visit Review Request",
            channel: "sms",
            trigger_type: "manual_batch",
            sms_template: "Hi {customer_name}! Thanks for visiting {business_name} today. We'd love your feedback — it takes 30 seconds: {review_link}",
            email_subject: "How was your visit to {business_name}?",
            email_template: "<p>Hi {customer_name},</p><p>Thank you for visiting {business_name} today! We'd really appreciate your feedback — it helps us improve and helps others discover us.</p><p><a href=\"{review_link}\">Leave a Review</a></p>",
            delay_minutes: 60,
            follow_up_enabled: true,
            follow_up_delay_hours: 48,
            follow_up_template: "Hi {customer_name}, just a friendly reminder — we'd love to hear about your experience at {business_name}: {review_link}"
        }
    },
    {
        id: "appointment-followup",
        name: "Appointment Follow-up",
        description: "Perfect for services, clinics, and salons. Optimized for appointments.",
        icon: Calendar,
        color: "text-blue-600 bg-blue-50 border-blue-100",
        defaultValues: {
            name: "Service Follow-up",
            channel: "both",
            trigger_type: "manual_batch",
            sms_template: "Hi {customer_name}, thanks for choosing {business_name} for your appointment. How did we do? {review_link}",
            email_subject: "Thank you for your visit to {business_name}",
            email_template: "<p>Hi {customer_name},</p><p>Standard service follow-up email...</p>", // Shortened for brevity
            delay_minutes: 120,
            follow_up_enabled: false,
            follow_up_delay_hours: 24,
            follow_up_template: ""
        }
    },
    {
        id: "re-engagement",
        name: "Customer Re-engagement",
        description: "Bring back customers who haven't visited in a while.",
        icon: Users,
        color: "text-purple-600 bg-purple-50 border-purple-100",
        defaultValues: {
            name: "Re-engagement Campaign",
            channel: "email",
            trigger_type: "manual_batch",
            sms_template: "Hi {customer_name}, we miss you at {business_name}! Hope to see you soon. {review_link}",
            email_subject: "We miss you at {business_name}!",
            email_template: "<p>Hi {customer_name},</p><p>It's been a while since your last visit...</p>",
            delay_minutes: 0,
            follow_up_enabled: true,
            follow_up_delay_hours: 72,
            follow_up_template: "Quick reminder: We'd love to see you back!"
        }
    }
];
