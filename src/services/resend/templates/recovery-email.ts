import { reviewRequestLayout } from "@/lib/email/review-request-layout";
import { escapeHtml } from "@/lib/security/html-escape";

interface RecoveryEmailProps { businessName: string; customerName?: string; senderName?: string }

function firstName(value: string | undefined): string {
    return (value || "").trim().split(/\s+/)[0] || "";
}

function recoveryLines({ businessName, customerName, senderName }: RecoveryEmailProps): string[] {
    const sender = (senderName || "").trim();
    return [
        `Hi ${firstName(customerName) || "there"},`,
        `Thank you for telling us about your recent experience at ${businessName}. We're sorry it didn't meet your expectations.`,
        "We've received your feedback and our team will review it. It helps us understand what went wrong and where we can improve.",
        "If you shared your contact details, someone from our team may reach out. You can also just reply to this email.",
        sender ? `Best regards,\n${sender}, ${businessName}` : `Best regards,\nThe ${businessName} team`,
    ];
}

/** Plain-text alternative of the recovery letter. */
export function recoveryEmailPlainText(props: RecoveryEmailProps): string {
    return recoveryLines(props).join("\n\n");
}

/**
 * Private-feedback reply to the business's customer. Sent on the business's behalf
 * as a plain personal letter: no Zyene branding, replies go to the business.
 */
export function recoveryEmailTemplate(props: RecoveryEmailProps): string {
    const body = recoveryLines(props)
        .map((line) => `<p style="margin:0 0 16px;">${escapeHtml(line).replace(/\n/g, "<br>")}</p>`)
        .join("\n");
    return reviewRequestLayout(body, props.businessName);
}
