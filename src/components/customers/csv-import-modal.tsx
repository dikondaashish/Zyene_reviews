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
import { Loader2, Upload, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
    const [hasConsent, setHasConsent] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".csv")) {
            toast.error("Please upload a CSV file");
            return;
        }

        setFileName(file.name);

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
        if (!hasConsent) {
            toast.error("Please acknowledge the consent requirement");
            return;
        }

        if (csvData.length === 0) {
            toast.error("No data to import");
            return;
        }

        setIsLoading(true);
        try {
            const customersToImport = csvData
                .filter((row) => row.email || row.name)
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
                toast.error("No valid customers found in CSV");
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
                throw new Error(error.error || "Failed to import customers");
            }

            const result = await response.json();
            toast.success(`Successfully imported ${result.imported} customers`);
            onOpenChange(false);
            resetState();
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to import customers");
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = () => {
        setFileName(null);
        setCSVData([]);
        setHasConsent(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) resetState();
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Import Customers</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file. Required columns: name or email.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
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
                    </div>

                    {csvData.length > 0 && (
                        <div className="space-y-3">
                            <div className="bg-slate-50 rounded-lg p-3 max-h-32 overflow-y-auto text-xs border">
                                <table className="w-full">
                                    <tbody>
                                        {csvData.slice(0, 3).map((row, idx) => (
                                            <tr key={idx} className="border-b last:border-0">
                                                <td className="py-1 pr-2 truncate font-medium">{row.name || "—"}</td>
                                                <td className="py-1 truncate text-muted-foreground">{row.email || "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-3">
                                <div className="flex gap-3">
                                    <ShieldCheck className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-orange-900">Compliance Acknowledgment</p>
                                        <p className="text-xs text-orange-800/80 leading-relaxed">
                                            I certify that I have obtained express consent to contact these individuals via SMS/Email in accordance with TCPA/CAN-SPAM.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 pt-1 border-t border-orange-100">
                                    <Checkbox 
                                        id="consent" 
                                        checked={hasConsent}
                                        onCheckedChange={(v) => setHasConsent(v as boolean)}
                                    />
                                    <Label htmlFor="consent" className="text-xs font-medium text-orange-900 cursor-pointer">
                                        I confirm I have explicit consent.
                                    </Label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleImport} disabled={isLoading || csvData.length === 0 || !hasConsent}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isLoading ? "Importing..." : "Import Customers"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
