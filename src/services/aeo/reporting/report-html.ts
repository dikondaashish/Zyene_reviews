import type { AeoReportModel } from "./report-model";
import { percent } from "./report-model";
import { DEFAULT_AEO_REPORT_COLOR } from "./report-colors";

function escapeHtml(value: string): string {
    return value.replace(/[&<>'"]/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
    })[char] ?? char);
}

export function renderAeoReportHtml(model: AeoReportModel): string {
    const rows = model.topPrompts.map((row) => `<tr><td>${escapeHtml(row.prompt)}</td><td>${row.named}/${row.samples}</td></tr>`).join("");
    const brand = model.brandLogoUrl
        ? `<img src="${escapeHtml(model.brandLogoUrl)}" alt="${escapeHtml(model.brandName)}" height="40">`
        : escapeHtml(model.brandName);
    const powered = model.hidePoweredBy ? "" : "<div>Powered by Zyene Reviews</div>";
    return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(model.businessName)} AEO report</title>
<style>body{font-family:Arial,sans-serif;color:#17202a;max-width:900px;margin:40px auto;padding:0 24px}header{border-bottom:3px solid ${escapeHtml(model.brandColor ?? DEFAULT_AEO_REPORT_COLOR)};padding-bottom:18px}header img{max-width:220px;object-fit:contain}h1{font-size:28px;margin:12px 0 8px}.period{color:#52606d}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0}.metric{border:1px solid #d9e2ec;padding:16px}.value{font-size:24px;font-weight:700;margin-top:6px}table{width:100%;border-collapse:collapse}th,td{text-align:left;border-bottom:1px solid #d9e2ec;padding:10px 6px}footer{color:#7b8794;font-size:12px;margin-top:30px}</style></head><body>
<header><div>${brand}</div><h1>${escapeHtml(model.businessName)} AI visibility report</h1><div class="period">${model.periodStart} through ${model.periodEnd}</div></header>
<section class="metrics"><div class="metric">Visibility<div class="value">${percent(model.visibilityPercent)}</div></div><div class="metric">Successful samples<div class="value">${model.successfulSamples}/${model.totalSamples}</div></div><div class="metric">Owned citations<div class="value">${model.ownCitations}/${model.citations}</div></div><div class="metric">Competitor mentions<div class="value">${model.competitorMentions}</div></div><div class="metric">Technical findings<div class="value">${model.technicalFindings}</div></div></section>
<h2>Top tracked prompts</h2><table><thead><tr><th>Prompt</th><th>Brand named</th></tr></thead><tbody>${rows || '<tr><td colspan="2">No measured prompts in this period.</td></tr>'}</tbody></table>
<footer>Measured from stored answer-engine samples. Failed and estimated samples are excluded from visibility.${powered}</footer></body></html>`;
}
