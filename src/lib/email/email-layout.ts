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
        : `<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td width="32" style="padding-right:10px;"><a href="${EMAIL_BRAND.website}" aria-label="Zyene Reviews website"><img src="${EMAIL_BRAND.logo}" alt="Zyene logo" width="32" height="32" style="display:block;width:32px;height:32px;border:0;border-radius:5px;"></a></td><td class="email-brand" style="color:#18181b;font-size:17px;font-weight:600;line-height:1.3;">Zyene Reviews</td></tr></table>`;
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
a{color:${EMAIL_BRAND.link}}h1{line-height:1.3}h2,h3{line-height:1.4}
.email-content h2,.email-content h3{font-weight:600}
.email-cta{color:${EMAIL_BRAND.buttonText}!important;-webkit-text-fill-color:${EMAIL_BRAND.buttonText}!important}
img{border:0;outline:none;text-decoration:none}a[x-apple-data-detectors]{color:inherit!important}
@media only screen and (max-width:620px){
.email-outer{padding:0!important}.email-content{padding:28px 24px 24px!important}
.email-footer{padding:0 24px 28px!important}
.email-heading{font-size:23px!important}.email-stat{padding:12px 4px!important}
}
@media (prefers-color-scheme:dark){
.email-bg,.email-card{background-color:#18181b!important}
.email-content,.email-heading,.email-brand,.email-content h2,.email-content h3,.email-stat-number{color:#fafafa!important}
.email-content p,.email-content li,.email-content td,.email-content blockquote{color:#d4d4d8!important}
.email-panel{background-color:#27272a!important;border-color:#3f3f46!important;color:#fafafa!important}
.email-footer,.email-footer a,.email-muted{color:#d4d4d8!important}
.email-content a:not(.email-cta),.email-footer a{color:${EMAIL_BRAND.darkLink}!important}.email-rule{border-color:#3f3f46!important}
}
[data-ogsc] .email-bg{background-color:#18181b!important}
[data-ogsc] .email-card{background-color:#18181b!important}
[data-ogsc] .email-content,[data-ogsc] .email-heading,[data-ogsc] .email-brand,[data-ogsc] h2,[data-ogsc] h3,[data-ogsc] .email-stat-number{color:#fafafa!important}
[data-ogsc] .email-content p,[data-ogsc] .email-content li,[data-ogsc] .email-content td{color:#d4d4d8!important}
[data-ogsc] .email-panel{background-color:#27272a!important;border-color:#3f3f46!important}
[data-ogsc] .email-footer,[data-ogsc] .email-footer a,[data-ogsc] .email-muted{color:#d4d4d8!important}
[data-ogsc] .email-content a:not(.email-cta),[data-ogsc] .email-footer a{color:${EMAIL_BRAND.darkLink}!important}
[data-ogsc] .email-rule{border-color:#3f3f46!important}
</style></head>
<body class="email-bg" style="margin:0;padding:0;width:100%;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
<div aria-hidden="true" style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>
<table class="email-bg" role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;background-color:#ffffff;">
<tr><td class="email-outer" align="center" style="padding:16px 16px 32px;">
<!--[if mso]><table role="presentation" width="580" border="0" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
<table class="email-card" role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;max-width:580px;table-layout:fixed;background-color:#ffffff;">
<tr><td class="email-content" style="padding:32px 40px;color:#3f3f46;font-size:15px;line-height:1.7;word-break:break-word;">
<div class="email-brand" style="margin-bottom:36px;color:#18181b;">${brand}</div>
${!whiteLabel && brandName !== EMAIL_BRAND.name ? `<p style="margin:0 0 16px;font-weight:700;">${escapeHtml(brandName)}</p>` : ""}
${eyebrow ? `<p class="email-muted" style="margin:0 0 8px;font-size:12px;color:#52525b;">${escapeHtml(eyebrow)}</p>` : ""}
<h1 class="email-heading" style="margin:0 0 20px;font-size:24px;line-height:1.3;font-weight:600;letter-spacing:-0.4px;color:#18181b;">${escapeHtml(title)}</h1>
${bodyHtml}
</td></tr>
<tr><td class="email-footer" style="padding:0 40px 24px;color:#52525b;font-size:12px;line-height:1.7;word-break:break-word;">
<div class="email-rule" style="border-top:1px solid #e4e4e7;padding-top:16px;">
${footer}
${whiteLabel ? `<p style="margin:12px 0 0;">© ${new Date().getFullYear()} ${escapeHtml(brandName)}</p>` : emailCompanyFooter()}</div>
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
}

/** Cell padding provides a visual fallback for Word-based Outlook. */
export function emailButton(label: string, url: string): string {
    return `<table class="email-button" role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:24px 0;width:auto;max-width:100%;">
<tr><td align="center" bgcolor="${EMAIL_BRAND.button}" style="background-color:${EMAIL_BRAND.button};border-radius:5px;mso-padding-alt:12px 20px;">
<a class="email-cta" href="${escapeHtml(url)}" style="display:block;padding:12px 20px;font-size:14px;line-height:20px;font-weight:600;color:${EMAIL_BRAND.buttonText};text-decoration:none;word-break:normal;">${escapeHtml(label)}</a>
</td></tr></table>`;
}

export function emailParagraph(text: string): string {
    return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;">${escapeHtml(text)}</p>`;
}

export function emailSettingsFooter(url: string, label = "Manage notification settings"): string {
    return `<a href="${escapeHtml(url)}" style="color:${EMAIL_BRAND.link};text-decoration:underline;">${escapeHtml(label)}</a>`;
}

export function emailPanel(bodyHtml: string): string {
    return `<div class="email-panel" style="padding:16px 20px;margin:20px 0;background-color:#fafafa;border:1px solid #e4e4e7;border-radius:5px;">${bodyHtml}</div>`;
}
