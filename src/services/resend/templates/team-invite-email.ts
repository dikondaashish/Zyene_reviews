import { emailButton, emailLayout, emailParagraph } from "@/lib/email/email-layout";
import { escapeHtml } from "@/lib/security/html-escape";

export function teamInviteEmail(inviteLink: string, inviterName: string, organizationName: string): string {
    return emailLayout({
        title: `Join ${organizationName} on Zyene Reviews`,
        preheader: `${inviterName} invited you to help manage your team's reviews.`,
        eyebrow: "Team invitation",
        bodyHtml: emailParagraph(`${inviterName} has invited you to join ${organizationName} on Zyene Reviews.`)
            + emailParagraph("Accept the invitation to access your team's workspace and manage customer reviews together.")
            + emailButton("Accept invitation", inviteLink)
            + `<p style="font-size:14px;">If the button doesn't work, copy this link into your browser:</p>
<p style="font-size:14px;word-break:break-all;"><a href="${escapeHtml(inviteLink)}">${escapeHtml(inviteLink)}</a></p>`,
        footerHtml: "If you weren't expecting this invitation, you can ignore this email. No access is granted until you accept.",
    });
}
