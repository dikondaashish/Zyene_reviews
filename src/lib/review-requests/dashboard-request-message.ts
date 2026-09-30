import { smsLabel } from "@/lib/security/sms-label";

/** Shared by the dashboard preview and sender to keep the displayed SMS accurate. */
export function dashboardRequestSms(displayName: string, businessName: string, reviewLink: string): string {
    return `Hi ${smsLabel(displayName, "there")}! Thanks for visiting ${smsLabel(businessName, "us")}. We'd love your feedback - it only takes 30 seconds: ${reviewLink}\nReply STOP to opt out.`;
}
