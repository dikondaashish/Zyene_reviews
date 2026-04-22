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

export function ReportGenerator({ businessName = "Business", dateRange = "Last 30 Days" }: ReportGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = async () => {
        setIsGenerating(true);
        const toastId = toast.loading("Generating professional PDF report...");

        try {
            // Find the analytics container
            const element = document.getElementById("analytics-content");
            if (!element) {
                throw new Error("Analytics content not found");
            }

            // Capture the element as a canvas
            const canvas = await html2canvas(element, {
                scale: 2, // Higher quality
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                windowWidth: 1200, // Fixed width for consistent layout
            });

            const imgData = canvas.toDataURL("image/png");
            
            // Create a standard A4 multi-page PDF to avoid oversized-canvas failures.
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
            
            // Save PDF
            const safeRange = dateRange.replace(/\s+/g, "-");
            const fileName = `Zyene-Reviews-Report-${businessName.replace(/\s+/g, "-")}-${safeRange}-${new Date().toISOString().split("T")[0]}.pdf`;
            pdf.save(fileName);

            toast.success("Report downloaded successfully!", { id: toastId });
        } catch (error) {
            console.error("PDF generation failed:", error);
            toast.error("Failed to generate report. Please try again.", { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
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
