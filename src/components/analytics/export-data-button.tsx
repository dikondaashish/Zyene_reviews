"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExportDataButtonProps {
    businessId?: string | null;
    range: string;
    platform: string;
}

export function ExportDataButton({ businessId, range, platform }: ExportDataButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!businessId) {
            toast.error("No active business selected");
            return;
        }

        setIsExporting(true);
        const toastId = toast.loading("Preparing your analytics data...");

        try {
            const response = await fetch(
                `/api/analytics/export?range=${encodeURIComponent(range)}&platform=${encodeURIComponent(platform)}`,
                { credentials: "include" }
            );
            
            if (!response.ok) {
                const message = await response.text().catch(() => "Failed to export data");
                throw new Error(message || "Failed to export data");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const disposition = response.headers.get("content-disposition") || "";
            const matched = disposition.match(/filename="([^"]+)"/i);
            a.download =
                matched?.[1] ||
                `analytics_export_${platform}_${range}_${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Data exported successfully!", { id: toastId });
        } catch (error) {
            toast.error("Failed to export data. Please try again.", { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2"
        >
            {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            {isExporting ? "Exporting..." : "Export CSV"}
        </button>
    );
}
