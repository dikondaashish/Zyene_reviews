import { jsPDF } from "jspdf";
import type { AeoReportModel } from "./report-model";
import { percent } from "./report-model";

export function renderAeoReportPdf(model: AeoReportModel): Uint8Array {
    const pdf = new jsPDF({ unit: "pt", format: "letter" });
    const color = model.brandColor && /^#[0-9a-f]{6}$/i.test(model.brandColor) ? model.brandColor : "#0f766e";
    pdf.setTextColor(color);
    pdf.setFontSize(12);
    if (model.brandLogoDataUrl) {
        const format = model.brandLogoDataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
        pdf.addImage(model.brandLogoDataUrl, format, 48, 28, 120, 40, undefined, "FAST");
    } else pdf.text(model.brandName, 48, 48);
    pdf.setTextColor(23, 32, 42);
    pdf.setFontSize(24);
    pdf.text(`${model.businessName} AI visibility report`, 48, 80, { maxWidth: 510 });
    pdf.setFontSize(10);
    pdf.text(`${model.periodStart} through ${model.periodEnd}`, 48, 104);
    pdf.line(48, 116, 564, 116);
    const metrics = [
        ["Visibility", percent(model.visibilityPercent)],
        ["Successful samples", `${model.successfulSamples}/${model.totalSamples}`],
        ["Owned citations", `${model.ownCitations}/${model.citations}`],
        ["Competitor mentions", String(model.competitorMentions)],
        ["Technical findings", String(model.technicalFindings)],
    ];
    metrics.forEach(([label, value], index) => {
        const x = 48 + (index % 3) * 172;
        const y = 152 + Math.floor(index / 3) * 70;
        pdf.setFontSize(9); pdf.setTextColor(82, 96, 109); pdf.text(label, x, y);
        pdf.setFontSize(18); pdf.setTextColor(23, 32, 42); pdf.text(value, x, y + 24);
    });
    let y = 320;
    pdf.setFontSize(15); pdf.text("Top tracked prompts", 48, y); y += 24;
    pdf.setFontSize(9);
    for (const row of model.topPrompts.slice(0, 12)) {
        const prompt = row.prompt.length > 78 ? `${row.prompt.slice(0, 75)}...` : row.prompt;
        pdf.text(prompt, 48, y, { maxWidth: 420 });
        pdf.text(`${row.named}/${row.samples}`, 520, y, { align: "right" });
        y += 22;
    }
    if (model.topPrompts.length === 0) pdf.text("No measured prompts in this period.", 48, y);
    pdf.setFontSize(8); pdf.setTextColor(123, 135, 148);
    pdf.text("Measured from stored answer-engine samples. Failed and estimated samples are excluded.", 48, 742);
    if (!model.hidePoweredBy) pdf.text("Powered by Zyene Reviews", 564, 742, { align: "right" });
    return new Uint8Array(pdf.output("arraybuffer"));
}
