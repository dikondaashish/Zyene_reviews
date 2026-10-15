import { emailButton, emailLayout, emailParagraph } from "@/lib/email/email-layout";

interface PaymentSuccessEmailProps { userName: string; amount: string; date: string; invoiceUrl: string }

export function paymentSuccessEmail({ userName, amount, date, invoiceUrl }: PaymentSuccessEmailProps): string {
    return emailLayout({
        title: "Payment received",
        preheader: `Your payment of ${amount} was processed on ${date}.`,
        eyebrow: "Billing confirmation",
        bodyHtml: emailParagraph(`Hi ${userName},`)
            + emailParagraph(`We've received your payment of ${amount} on ${date}. Thank you for using Zyene Reviews.`)
            + (invoiceUrl ? emailButton("View your invoice", invoiceUrl) : "")
            + emailParagraph("You can view your invoices, renewal details, and payment method in Settings → Billing."),
    });
}
