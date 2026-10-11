import { escapeHtml } from "@/lib/security/html-escape";
import { EMAIL_BRAND, emailCompanyFooter } from "@/lib/email/email-brand";

interface EmailLayoutProps {
    title: string;
    preheader: string;
    bodyHtml: string;
    eyebrow?: string;
    footerHtml?: string;
    brandName?: string;
    brandLogoUrl?: string | null;
    hidePoweredBy?: boolean;
}

/** Inline styles are the fallback; media queries enhance clients that support them. */
export function emailLayout({
    title, preheader, bodyHtml, eyebrow, footerHtml,
    brandName = "Zyene Reviews", brandLogoUrl, hidePoweredBy = false,
}: EmailLayoutProps): string {
    const whiteLabel = hidePoweredBy && brandName !== EMAIL_BRAND.name;
    const brand = whiteLabel && brandLogoUrl
        ? `<img src="${escapeHtml(brandLogoUrl)}" alt="${escapeHtml(brandName)}" width="160" height="40" style="display:block;max-width:100%;height:auto;border:0;">`
        : whiteLabel ? `<span style="font-size:20px;font-weight:700;">${escapeHtml(brandName)}</span>`
        : `<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td width="48" style="padding-right:12px;"><a href="${EMAIL_BRAND.website}" aria-label="Zyene Reviews website"><img src="${EMAIL_BRAND.logo}" alt="Zyene logo" width="48" height="48" style="display:block;width:48px;height:48px;border:0;border-radius:8px;"></a></td><td class="email-brand" style="color:#18181b;font-size:20px;font-weight:700;line-height:1.3;">Zyene Reviews<br><span class="email-muted" style="font-size:12px;font-weight:400;color:#52525b;">by Zyene, Inc.</span></td></tr></table>`;
    const footer = footerHtml ?? "";
    return `<!DOCTYPE html>
<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(title)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt}
td{word-wrap:break-word;overflow-wrap:anywhere}p{margin:0 0 16px}
a{color:${EMAIL_BRAND.link}}h1{line-height:1.25}h2,h3{line-height:1.4}
.email-card.email-branded-card{border-top-color:${EMAIL_BRAND.accent}!important}
img{border:0;outline:none;text-decoration:none}a[x-apple-data-detectors]{color:inherit!important}
@media only screen and (max-width:620px){
.email-outer{padding:16px 12px!important}.email-content{padding:24px 20px!important}
.email-footer{padding:20px!important}.email-button{width:100%!important}
.email-heading{font-size:24px!important}.email-stat{padding:12px 4px!important}
}
@media (prefers-color-scheme:dark){
.email-bg{background-color:#18181b!important}.email-card{background-color:#27272a!important;border-color:#3f3f46!important}
.email-content,.email-heading,.email-brand,.email-content h2,.email-content h3,.email-stat-number{color:#fafafa!important}
.email-content p,.email-content li,.email-content td,.email-content blockquote{color:#d4d4d8!important}
.email-panel{background-color:#18181b!important;border-color:#3f3f46!important;color:#fafafa!important}
.email-footer,.email-footer a,.email-muted{color:#d4d4d8!important}
.email-content a:not(.email-cta),.email-footer a{color:${EMAIL_BRAND.darkLink}!important}.email-content .email-cta{color:#18181b!important}
}
[data-ogsc] .email-bg{background-color:#18181b!important}
[data-ogsc] .email-card{background-color:#27272a!important}
[data-ogsc] .email-content,[data-ogsc] .email-heading,[data-ogsc] .email-brand,[data-ogsc] h2,[data-ogsc] h3,[data-ogsc] .email-stat-number{color:#fafafa!important}
[data-ogsc] .email-content p,[data-ogsc] .email-content li,[data-ogsc] .email-content td{color:#d4d4d8!important}
[data-ogsc] .email-panel{background-color:#18181b!important;border-color:#3f3f46!important}
[data-ogsc] .email-footer,[data-ogsc] .email-footer a,[data-ogsc] .email-muted{color:#d4d4d8!important}
[data-ogsc] .email-content a:not(.email-cta),[data-ogsc] .email-footer a{color:${EMAIL_BRAND.darkLink}!important}
[data-ogsc] .email-content .email-cta{color:#18181b!important}
</style></head>
<body class="email-bg" style="margin:0;padding:0;width:100%;background-color:#f5f5f4;font-family:Arial,Helvetica,sans-serif;">
<div aria-hidden="true" style="display:none;font-size:1px;color:#f5f5f4;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>
<table class="email-bg" role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;background-color:#f5f5f4;">
<tr><td class="email-outer" align="center" style="padding:32px 16px;">
<!--[if mso]><table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
<table class="email-card${whiteLabel ? "" : " email-branded-card"}" role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;table-layout:fixed;background-color:#ffffff;border:1px solid #e4e4e7;border-top:4px solid ${whiteLabel ? "#e4e4e7" : EMAIL_BRAND.accent};border-radius:12px;">
<tr><td class="email-content" style="padding:32px;color:#52525b;font-size:16px;line-height:1.6;word-break:break-word;">
<div class="email-brand" style="margin-bottom:32px;color:#18181b;">${brand}</div>
${!whiteLabel && brandName !== EMAIL_BRAND.name ? `<p style="margin:0 0 16px;font-weight:700;">${escapeHtml(brandName)}</p>` : ""}
${eyebrow ? `<p class="email-muted" style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:1px;color:#52525b;text-transform:uppercase;">${escapeHtml(eyebrow)}</p>` : ""}
<h1 class="email-heading" style="margin:0 0 20px;font-size:26px;line-height:1.25;font-weight:700;letter-spacing:-0.5px;color:#18181b;">${escapeHtml(title)}</h1>
${bodyHtml}
</td></tr>
<tr><td class="email-footer" style="padding:24px 32px;border-top:1px solid #e4e4e7;color:#52525b;font-size:13px;line-height:1.6;word-break:break-word;">
${footer}
${whiteLabel ? `<p style="margin:12px 0 0;">© ${new Date().getFullYear()} ${escapeHtml(brandName)}</p>` : emailCompanyFooter()}
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
}

/** Cell padding provides a visual fallback for Word-based Outlook. */
export function emailButton(label: string, url: string): string {
    return `<table class="email-button" role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:24px 0;width:auto;max-width:100%;">
<tr><td align="center" bgcolor="${EMAIL_BRAND.accent}" style="background-color:${EMAIL_BRAND.accent};border-radius:6px;mso-padding-alt:14px 22px;">
<a class="email-cta" href="${escapeHtml(url)}" style="display:block;padding:14px 22px;font-size:16px;line-height:24px;font-weight:700;color:#18181b;text-decoration:none;word-break:normal;">${escapeHtml(label)}</a>
</td></tr></table>`;
}

export function emailParagraph(text: string): string {
    return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${escapeHtml(text)}</p>`;
}

export function emailSettingsFooter(url: string, label = "Manage notification settings"): string {
    return `<a href="${escapeHtml(url)}" style="color:${EMAIL_BRAND.link};text-decoration:underline;">${escapeHtml(label)}</a>`;
}

export function emailPanel(bodyHtml: string): string {
    return `<div class="email-panel" style="padding:20px;margin:20px 0;background-color:#f5f5f4;border:1px solid #e4e4e7;border-radius:8px;">${bodyHtml}</div>`;
}
