"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";

interface CSVImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface CSVRow {
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
    [key: string]: string | undefined;
}

export function CSVImportModal({ open, onOpenChange }: CSVImportModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [csvData, setCSVData] = useState<CSVRow[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.name.endsWith(".csv")) {
            toast.error("Please upload a CSV file");
            return;
        }

        setFileName(file.name);

        // Parse CSV
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length === 0) {
                    toast.error("CSV file is empty");
                    return;
                }
                setCSVData(results.data as CSVRow[]);
                toast.success(`CSV loaded: ${results.data.length} rows`);
            },
            error: (error) => {
                toast.error(`Failed to parse CSV: ${error.message}`);
            },
        });
    };

    const handleImport = async () => {
        if (csvData.length === 0) {
            toast.error("No data to import");
            return;
        }

        setIsLoading(true);
        try {
            // Map CSV rows to customer format - match the API endpoint expectations
            const customersToImport = csvData
                .filter((row) => row.email || row.name) // At least email or name
                .map((row) => {
                    const nameParts = (row.name || "").trim().split(/\s+/);
                    return {
                        first_name: nameParts[0] || null,
                        last_name: nameParts.slice(1).join(" ") || null,
                        email: row.email || null,
                        phone: row.phone || null,
                    };
                });

            if (customersToImport.length === 0) {
                toast.error("No valid customers found in CSV (need at least name or email)");
                setIsLoading(false);
                return;
            }

            const response = await fetch("/api/customers/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customers: customersToImport }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || error.message || "Failed to import customers");
            }

            const result = await response.json();
            toast.success(`Successfully imported ${result.imported} customers`);
            onOpenChange(false);
            setFileName(null);
            setCSVData([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to import customers");
            console.error("Error importing customers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Import Customers from CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file with customer data. Required columns: name or email
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* File Upload Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-slate-400 transition-colors"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="font-medium text-sm">
                            {fileName ? fileName : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">CSV files only</p>
                    </div>

                    {/* CSV Format Help */}
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-medium flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            CSV Format
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Your CSV should include columns like: <strong>name</strong>, <strong>email</strong>, <strong>phone</strong>, <strong>notes</strong>
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Example:
                        </p>
                        <pre className="text-xs bg-white dark:bg-slate-950 p-2 rounded border text-muted-foreground overflow-x-auto">
                            {`name,email,phone
John Doe,john@example.com,(555) 123-4567
Jane Smith,jane@example.com,(555) 987-6543`}
                        </pre>
                    </div>

                    {/* Data Preview */}
                    {csvData.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Preview: {csvData.length} rows loaded</p>
                            <div className="bg-slate-50 dark:bg-slate-950 rounded p-3 max-h-32 overflow-y-auto text-xs">
                                <table className="w-full">
                                    <tbody>
                                        {csvData.slice(0, 3).map((row, idx) => (
                                            <tr key={idx} className="border-b last:border-0">
                                                <td className="py-1 pr-2 text-muted-foreground truncate">
                                                    {row.name || row.email || "—"}
                                                </td>
                                                <td className="py-1 text-muted-foreground truncate">
                                                    {row.email || "—"}
                                                </td>
                                            </tr>
                                        ))}
                                        {csvData.length > 3 && (
                                            <tr>
                                                <td colSpan={2} className="py-1 text-muted-foreground text-center">
                                                    ... and {csvData.length - 3} more
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            setFileName(null);
                            setCSVData([]);
                            if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                            }
                        }}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={isLoading || csvData.length === 0}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? "Importing..." : "Import Customers"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
