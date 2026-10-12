import { emailButton, emailLayout, emailPanel, emailParagraph } from "@/lib/email/email-layout";

interface PaymentFailedEmailProps { userName: string; amount: string; updateCardUrl: string }

export function paymentFailedEmail({ userName, amount, updateCardUrl }: PaymentFailedEmailProps): string {
    return emailLayout({
        title: "Please update your payment method",
        preheader: `We couldn't process your payment of ${amount}. Check your billing details.`,
        eyebrow: "Payment unsuccessful",
        bodyHtml: emailParagraph(`Hi ${userName},`)
            + emailParagraph(`We couldn't process your payment of ${amount}. Please check your payment method to help avoid an interruption to your subscription.`)
            + emailButton("Update payment method", updateCardUrl)
            + emailPanel(emailParagraph("If you've already updated your payment details, check Settings → Billing for the latest invoice status. Your bank may also be able to explain why the payment was declined.")),
    });
}
