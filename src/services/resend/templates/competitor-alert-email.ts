import { emailButton, emailLayout, emailParagraph, emailSettingsFooter } from "@/lib/email/email-layout";

export function competitorAlertEmail(props: { businessName: string; title: string; summary: string; dashboardUrl: string; settingsUrl: string }): string {
    return emailLayout({
        title: props.title,
        preheader: `A competitor monitoring update for ${props.businessName}.`,
        eyebrow: "Competitor monitoring",
        bodyHtml: emailParagraph(`Update for ${props.businessName}`) + emailParagraph(props.summary)
            + emailButton("See your competitors", props.dashboardUrl),
        footerHtml: emailSettingsFooter(props.settingsUrl, "Manage competitor alert settings"),
    });
}
