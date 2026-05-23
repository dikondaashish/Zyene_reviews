"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateAnalyticsReportPdf } from "./report-generator-pdf";

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
            await generateAnalyticsReportPdf({ businessName, dateRange });
            toast.success("Report downloaded successfully!", { id: toastId });
        } catch (error) {
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
                <Loader2 className="animate-spin size-4" />
            ) : (
                <FileDown className="size-4" />
            )}
            {isGenerating ? "Generating..." : "Download PDF Report"}
        </button>
    );
}
