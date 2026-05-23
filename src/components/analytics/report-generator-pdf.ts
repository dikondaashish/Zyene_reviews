import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/** Chrome/Safari roughly cap canvas edges around 8k–16k px; stay under to avoid blank/failed captures. */
const MAX_CANVAS_EDGE = 8192;

export function sanitizeReportFilenamePart(s: string): string {
    return s.replace(/[/\\?%*:|"<>]/g, "-").replace(/\s+/g, "-").slice(0, 80);
}

export async function generateAnalyticsReportPdf({
    businessName,
    dateRange,
}: {
    businessName: string;
    dateRange: string;
}): Promise<void> {
    const element = document.getElementById("analytics-content");
    if (!element) {
        throw new Error("Analytics content not found");
    }

    await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const w = Math.max(1, Math.ceil(element.scrollWidth));
    const h = Math.max(1, Math.ceil(element.scrollHeight));

    const desiredScale = 2;
    const scale = Math.min(
        desiredScale,
        MAX_CANVAS_EDGE / w,
        MAX_CANVAS_EDGE / h,
    );

    const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: "#ffffff",
        foreignObjectRendering: false,
        width: w,
        height: h,
        windowWidth: w,
        windowHeight: h,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        onclone: (_clonedDoc, clonedEl) => {
            clonedEl.querySelectorAll("iframe").forEach((n) => n.remove());
            clonedEl.querySelectorAll("*").forEach((node) => {
                if (node instanceof HTMLElement) {
                    node.style.setProperty("backdrop-filter", "none");
                    node.style.setProperty("-webkit-backdrop-filter", "none");
                }
            });
            clonedEl.querySelectorAll("img").forEach((node) => {
                const img = node as HTMLImageElement;
                const src = img.getAttribute("src") || "";
                if (src.startsWith("data:")) return;
                try {
                    const abs = new URL(src, window.location.origin);
                    if (abs.origin !== window.location.origin) {
                        img.remove();
                    }
                } catch {
                    img.remove();
                }
            });
        },
    });

    let imgData: string;
    try {
        imgData = canvas.toDataURL("image/png");
    } catch {
        throw new Error(
            "Could not export the page snapshot (often caused by embedded images). Try again after refreshing.",
        );
    }

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    const safeRange = sanitizeReportFilenamePart(dateRange);
    const safeBiz = sanitizeReportFilenamePart(businessName);
    const fileName = `Zyene-Reviews-Report-${safeBiz}-${safeRange}-${new Date().toISOString().split("T")[0]}.pdf`;
    pdf.save(fileName);
}
