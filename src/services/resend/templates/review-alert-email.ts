import { emailButton, emailLayout, emailPanel, emailParagraph, emailSettingsFooter } from "@/lib/email/email-layout";
import { escapeHtml } from "@/lib/security/html-escape";

interface ReviewAlertProps {
    businessName: string;
    rating: number;
    authorName: string;
    reviewText: string;
    urgencyScore: number;
    dashboardUrl: string;
    settingsUrl: string;
    customerEmail?: string;
    customerPhone?: string;
}

export function reviewAlertEmail(props: ReviewAlertProps): string {
    const { businessName, authorName, reviewText, urgencyScore, dashboardUrl, settingsUrl, customerEmail, customerPhone } = props;
    const rating = Math.max(0, Math.min(5, Math.round(props.rating) || 0));
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const phoneHref = customerPhone?.replace(/[^\d+]/g, "");
    const replyParams = new URLSearchParams({
        subject: "Regarding your recent feedback",
        body: `Hi ${authorName !== customerEmail ? authorName : "there"},\r\n\r\nTo help us look into this, could you share a bit more detail?\r\n\r\n`,
    }).toString().replaceAll("+", "%20");
    const replyHref = customerEmail ? `mailto:${encodeURIComponent(customerEmail)}?${replyParams}` : undefined;
    return emailLayout({
        title: `New feedback for ${businessName}`,
        preheader: `${authorName} left a ${rating}-star review. View the details in your inbox.`,
        eyebrow: "Review alert",
        bodyHtml: (urgencyScore >= 7 ? emailParagraph("High priority: please review this feedback and follow up.") : "")
            + emailParagraph(`${authorName} shared new feedback. Here's what they had to say:`)
            + emailPanel(`<p style="margin:0 0 12px;font-size:22px;">${stars} <span style="font-size:14px;">${rating} out of 5</span></p>`
                + emailParagraph(reviewText || "This customer left a rating without a written review."))
            + (customerPhone ? `<p style="font-size:14px;">Customer phone: ${phoneHref
                ? `<a href="tel:${phoneHref}">${escapeHtml(customerPhone)}</a>` : escapeHtml(customerPhone)}</p>` : "")
            + emailButton("View in dashboard", dashboardUrl)
            + (replyHref ? emailButton("Email the customer", replyHref) : "")
            + emailParagraph("A thoughtful, timely response helps customers feel heard."),
        footerHtml: emailSettingsFooter(settingsUrl),
    });
}
