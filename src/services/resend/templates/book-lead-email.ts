import { growthEmailLayout } from "./growth-emails";

export function bookLeadEmail({ downloadUrl }: { downloadUrl: string }): { subject: string; html: string } {
    return {
        subject: "Your Zyene Reviews reputation guide",
        html: growthEmailLayout({
            userName: "there",
            bodyHtml: `<p style="font-size:16px;line-height:1.6;color:#52525b;">Thanks for requesting the Zyene Reviews guide. It covers the practical systems local businesses use to turn customer feedback into regional growth.</p>
<p style="font-size:16px;line-height:1.6;color:#52525b;">Keep this guide handy as you build a fair review collection and response workflow.</p>`,
            ctaLabel: "Download your guide",
            ctaUrl: downloadUrl,
        }),
    };
}
