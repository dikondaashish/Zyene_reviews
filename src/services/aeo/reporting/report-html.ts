import { emailLayout, emailParagraph } from "@/lib/email/email-layout";
import { escapeHtml } from "@/lib/security/html-escape";
import type { AeoReportModel } from "@/services/aeo/reporting/report-model";
import { percent } from "@/services/aeo/reporting/report-model";
import { DEFAULT_AEO_REPORT_COLOR } from "@/services/aeo/reporting/report-colors";

export function renderAeoReportHtml(model: AeoReportModel): string {
    const brandColor = /^#[0-9a-f]{6}$/i.test(model.brandColor ?? "") ? model.brandColor! : DEFAULT_AEO_REPORT_COLOR;
    const metrics = [
        ["Visibility", percent(model.visibilityPercent)],
        ["Successful samples", `${model.successfulSamples}/${model.totalSamples}`],
        ["Owned citations", `${model.ownCitations}/${model.citations}`],
        ["Competitor mentions", String(model.competitorMentions)],
        ["Technical findings", String(model.technicalFindings)],
    ];
    const rows = model.topPrompts.map(row => `<tr><td style="padding:12px 8px;border-bottom:1px solid #e4e4e7;">${escapeHtml(row.prompt)}</td><td style="padding:12px 8px;border-bottom:1px solid #e4e4e7;">${row.named}/${row.samples}</td></tr>`).join("");
    return emailLayout({
        title: `${model.businessName} AI visibility report`,
        preheader: `Your measured AI visibility from ${model.periodStart} through ${model.periodEnd}.`,
        brandName: model.brandName, brandLogoUrl: model.brandLogoUrl, hidePoweredBy: model.hidePoweredBy,
        eyebrow: "AI visibility report",
        bodyHtml: `<div style="border-top:3px solid ${brandColor};padding-top:16px;">${emailParagraph(`${model.periodStart} through ${model.periodEnd}`)}</div>`
            + `<table class="email-panel" role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="table-layout:fixed;background-color:#f5f5f4;margin:24px 0;">${metrics.map(([label, value]) =>
                `<tr><td width="60%" style="padding:12px;font-size:14px;">${label}</td><td width="40%" style="padding:12px;font-weight:700;">${value}</td></tr>`).join("")}</table>`
            + `<h2 style="font-size:18px;color:#18181b;">Top tracked prompts</h2>
<table width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;font-size:14px;text-align:left;">
<thead><tr><th scope="col" width="70%" style="padding:12px 8px;border-bottom:1px solid #e4e4e7;">Prompt</th><th scope="col" width="30%" style="padding:12px 8px;border-bottom:1px solid #e4e4e7;">Brand named</th></tr></thead>
<tbody>${rows || '<tr><td colspan="2" style="padding:12px 8px;">No measured prompts in this period.</td></tr>'}</tbody></table>`,
        footerHtml: "Measured from stored answer-engine samples. Failed and estimated samples are excluded from visibility."
            + (model.hidePoweredBy ? "" : "<p style=\"margin:12px 0 0;\">Powered by Zyene Reviews</p>"),
    });
}
