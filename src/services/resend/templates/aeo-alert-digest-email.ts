import { emailButton, emailLayout, emailParagraph, emailSettingsFooter } from "@/lib/email/email-layout";
import { escapeHtml } from "@/lib/security/html-escape";

export interface AeoAlertDigestItem {
    severity: "critical" | "high" | "medium" | "low";
    title: string; detail: string; evidenceUrl: string;
}
interface AeoAlertDigestProps {
    businessName: string; alerts: AeoAlertDigestItem[];
    /** Total can exceed the displayed alerts after capping a large digest. */
    totalCount: number; dashboardUrl: string; settingsUrl: string;
}

export function aeoAlertDigestEmail({ businessName, alerts, totalCount, dashboardUrl, settingsUrl }: AeoAlertDigestProps): string {
    const rows = alerts.map(alert => `<div style="border-bottom:1px solid #e4e4e7;padding:16px 0;">
<p class="email-muted" style="margin:0 0 4px;font-size:12px;font-weight:700;text-transform:uppercase;">${escapeHtml(alert.severity)} priority</p>
<h2 style="margin:0 0 8px;font-size:18px;color:#18181b;">${escapeHtml(alert.title)}</h2>
${emailParagraph(alert.detail)}
<p style="margin:0;font-size:14px;"><a href="${escapeHtml(alert.evidenceUrl)}" style="color:#2563eb;text-decoration:underline;">View evidence</a></p></div>`).join("");
    return emailLayout({
        title: "Your AI visibility alerts",
        preheader: `${totalCount} alerts detected for ${businessName}. Review the supporting evidence.`,
        eyebrow: "AI visibility monitoring",
        bodyHtml: emailParagraph(`Here's what changed for ${businessName}.`)
            + (rows || emailParagraph("No new alerts to display."))
            + (totalCount > alerts.length ? emailParagraph(`+${totalCount - alerts.length} more — view the full list on your dashboard.`) : "")
            + emailButton("View alert details", dashboardUrl),
        footerHtml: emailSettingsFooter(settingsUrl),
    });
}
