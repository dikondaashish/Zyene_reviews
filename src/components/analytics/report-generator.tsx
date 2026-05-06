"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface ReportGeneratorProps {
    businessName?: string;
    dateRange?: string;
}

/** Chrome/Safari roughly cap canvas edges around 8k–16k px; stay under to avoid blank/failed captures. */
const MAX_CANVAS_EDGE = 8192;

function sanitizeFilenamePart(s: string): string {
    return s.replace(/[/\\?%*:|"<>]/g, "-").replace(/\s+/g, "-").slice(0, 80);
}

export function ReportGenerator({ businessName = "Business", dateRange = "Last 30 Days" }: ReportGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = async () => {
        setIsGenerating(true);
        const toastId = toast.loading("Generating professional PDF report...");

        try {
            const element = document.getElementById("analytics-content");
            if (!element) {
                throw new Error("Analytics content not found");
            }

            // Let charts / fonts finish layout before measuring.
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
                            node.style.backdropFilter = "none";
                            node.style.webkitBackdropFilter = "none";
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
            } catch (e) {
                console.error("Canvas toDataURL failed:", e);
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

            const safeRange = sanitizeFilenamePart(dateRange);
            const safeBiz = sanitizeFilenamePart(businessName);
            const fileName = `Zyene-Reviews-Report-${safeBiz}-${safeRange}-${new Date().toISOString().split("T")[0]}.pdf`;
            pdf.save(fileName);

            toast.success("Report downloaded successfully!", { id: toastId });
        } catch (error) {
            console.error("PDF generation failed:", error);
            const message = error instanceof Error ? error.message : "Unknown error";
            toast.error("Failed to generate report. Please try again.", {
                id: toastId,
                description: message.length > 160 ? `${message.slice(0, 157)}…` : message,
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            type="button"
            onClick={generatePDF}
            disabled={isGenerating}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
        >
            {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <FileDown className="h-4 w-4" />
            )}
            {isGenerating ? "Generating..." : "Download PDF Report"}
        </button>
    );
}
