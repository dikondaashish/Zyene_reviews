import { emailButton, emailLayout, emailParagraph } from "@/lib/email/email-layout";

interface SubscriptionCanceledEmailProps { userName: string; endDate: string; rejoinUrl: string }

export function subscriptionCanceledEmail({ userName, endDate, rejoinUrl }: SubscriptionCanceledEmailProps): string {
    // This template is sent by customer.subscription.deleted, after access ends.
    return emailLayout({
        title: "Your subscription has ended",
        preheader: "Your cancellation is confirmed. You can review plan options in Billing.",
        eyebrow: "Cancellation confirmation",
        bodyHtml: emailParagraph(`Hi ${userName},`)
            + emailParagraph(`This confirms that your Zyene Reviews subscription has ended. The recorded billing period end is ${endDate}.`)
            + emailParagraph("You can check your account's current access and available plans in Settings → Billing.")
            + emailButton("View billing and plans", rejoinUrl)
            + emailParagraph("Thank you for being a customer. If you'd like to share feedback or need help with your account, contact our team."),
    });
}
