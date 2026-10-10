import { emailLayout, emailParagraph } from "@/lib/email/email-layout";
import { escapeHtml } from "@/lib/security/html-escape";

interface RecoveryEmailProps { businessName: string; customerName?: string }

export function recoveryEmailTemplate({ businessName, customerName }: RecoveryEmailProps): string {
    return emailLayout({
        title: "Thank you for sharing your feedback",
        preheader: `${businessName} has received your feedback.`,
        brandName: businessName,
        bodyHtml: emailParagraph(customerName ? `Hi ${customerName},` : "Hi there,")
            + emailParagraph(`Thank you for telling us about your recent experience at ${businessName}. We're sorry it didn't meet your expectations.`)
            + emailParagraph("We've received your feedback for our team to review. It helps us understand what went wrong and where we can improve.")
            + emailParagraph("If you provided contact details, a member of our team may follow up to learn more.")
            + emailParagraph(`Best regards, The ${businessName} team`),
        footerHtml: `Sent on behalf of ${escapeHtml(businessName)} via Zyene Reviews.`,
        hidePoweredBy: true,
    });
}
