import { emailLayout } from "@/lib/email/email-layout";
import { escapeHtml } from "@/lib/security/html-escape";

/** Business context stays prominent inside the shared branded delivery frame. */
export function reviewRequestLayout(bodyHtml: string, businessName?: string): string {
    const fullDocument = /<html[\s>]/i.test(bodyHtml);
    const customStyles = fullDocument ? bodyHtml.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi)?.join("\n") ?? "" : "";
    const content = fullDocument ? bodyHtml.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? bodyHtml : bodyHtml;
    return emailLayout({
        title: "Share your experience",
        preheader: businessName ? `Your feedback helps ${businessName}.` : "Thank you for sharing your honest feedback.",
        eyebrow: businessName,
        bodyHtml: content,
        footerHtml: businessName ? `Sent on behalf of ${escapeHtml(businessName)} using Zyene Reviews.` : undefined,
    }).replace("</head>", `${customStyles}</head>`);
}
