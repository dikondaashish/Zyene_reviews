import { emailLayout, emailParagraph } from "@/lib/email/email-layout";
import { escapeHtml } from "@/lib/security/html-escape";

export function formReceiptEmail(kind: "contact" | "demo", name: string, subject?: string): string {
    return emailLayout({
        title: kind === "demo" ? "We received your demo request" : "We received your message",
        preheader: "Our team will follow up within one business day.",
        bodyHtml: emailParagraph(`Hi ${name || "there"},`)
            + emailParagraph(kind === "demo"
                ? "Thanks for your interest in Zyene Reviews. Our team will contact you within one business day to discuss your needs and arrange a walkthrough."
                : `Thanks for reaching out${subject ? ` about ${subject}` : ""}. Our team will reply within one business day.`)
            + emailParagraph("If you have anything to add, email contact@zyenereviews.com."),
    });
}

export function formNotificationEmail(title: string, fields: Record<string, string>, message?: string, source?: string): string {
    return emailLayout({
        title, preheader: "A new website inquiry is ready for review.",
        bodyHtml: `<ul style="margin:0;padding-left:24px;">${Object.entries(fields).map(([label, value]) =>
            `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</li>`).join("")}</ul>`
            + (message ? `<h2 style="font-size:18px;margin:24px 0 12px;">Message</h2><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>` : ""),
        footerHtml: source ? escapeHtml(source) : undefined,
    });
}
