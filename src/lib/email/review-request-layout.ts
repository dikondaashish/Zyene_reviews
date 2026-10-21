import { EMAIL_BRAND } from "@/lib/email/email-brand";
import { escapeHtml } from "@/lib/security/html-escape";

/**
 * Plain personal-letter frame for review requests. We send on the business's behalf,
 * so there is no Zyene logo, heading, card or company footer: just the business's message.
 */
export function reviewRequestLayout(bodyHtml: string, businessName?: string): string {
    const fullDocument = /<html[\s>]/i.test(bodyHtml);
    const customStyles = fullDocument ? bodyHtml.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi)?.join("\n") ?? "" : "";
    const content = fullDocument ? bodyHtml.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? bodyHtml : bodyHtml;
    const title = businessName ? escapeHtml(businessName) : "Your feedback";
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>p{margin:0 0 16px}a{color:${EMAIL_BRAND.link}}</style>
${customStyles}</head>
<body style="margin:0;padding:16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#222222;">
<div style="max-width:600px;">
${content}
</div>
</body>
</html>`;
}
