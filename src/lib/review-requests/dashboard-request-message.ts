/** Shared by the dashboard preview and sender to keep the displayed SMS accurate. */
export function dashboardRequestSms(displayName: string, businessName: string, reviewLink: string): string {
    return `Hi ${displayName}! Thanks for visiting ${businessName}. We'd love your feedback - it only takes 30 seconds: ${reviewLink}\nReply STOP to opt out.`;
}
