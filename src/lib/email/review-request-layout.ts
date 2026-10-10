/** A quiet, personal email with table and inline-style fallbacks. */
export function reviewRequestLayout(bodyHtml: string): string {
    return `<!DOCTYPE html><html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<title>Share your feedback</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt}
@media(prefers-color-scheme:dark){body,.request-bg{background-color:#18181b!important}.request-content,.request-content p{color:#fafafa!important}.request-content a{color:#93c5fd!important}}
[data-ogsc] .request-bg{background-color:#18181b!important}[data-ogsc] .request-content,[data-ogsc] .request-content p{color:#fafafa!important}[data-ogsc] .request-content a{color:#93c5fd!important}
</style></head><body class="request-bg" style="margin:0;padding:0;background-color:#ffffff;">
<table class="request-bg" role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;background-color:#ffffff;"><tr><td align="center" style="padding:24px 20px 32px;">
<!--[if mso]><table role="presentation" width="560" border="0" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;table-layout:fixed;"><tr><td class="request-content" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#202124;word-break:break-word;overflow-wrap:anywhere;">${bodyHtml}</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
}
