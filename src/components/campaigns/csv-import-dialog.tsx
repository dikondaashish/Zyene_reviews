"use client";

import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Check, AlertCircle, Loader2 } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CSVImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (contacts: { name?: string; email?: string; phone?: string }[]) => Promise<void>;
    isImporting: boolean;
}

export function CSVImportDialog({ open, onOpenChange, onImport, isImporting }: CSVImportDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [csvData, setCsvData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [step, setStep] = useState<"upload" | "mapping">("upload");
    const [mapping, setMapping] = useState({
        name: "",
        email: "",
        phone: ""
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
                toast.error("Please upload a CSV file");
                return;
            }
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length > 0) {
                    setCsvData(results.data);
                    const cols = Object.keys(results.data[0] as object);
                    setHeaders(cols);

                    // Auto-map based on common names
                    const newMapping = { name: "", email: "", phone: "" };
                    cols.forEach(col => {
                        const low = col.toLowerCase();
                        if (low.includes("name") || low === "customer") newMapping.name = col;
                        if (low.includes("email") || low === "mail") newMapping.email = col;
                        if (low.includes("phone") || low === "tel" || low === "mobile") newMapping.phone = col;
                    });
                    setMapping(newMapping);
                    setStep("mapping");
                } else {
                    toast.error("CSV file is empty");
                }
            },
            error: (err) => {
                toast.error(`Error parsing CSV: ${err.message}`);
            }
        });
    };

    const handleImport = async () => {
        if (!mapping.email && !mapping.phone) {
            toast.error("Please map at least Email or Phone column");
            return;
        }

        const contacts = csvData.map(row => ({
            name: mapping.name ? row[mapping.name] : undefined,
            email: mapping.email ? row[mapping.email] : undefined,
            phone: mapping.phone ? row[mapping.phone] : undefined,
        })).filter(c => c.email || c.phone);

        if (contacts.length === 0) {
            toast.error("No valid contacts found in CSV");
            return;
        }

        try {
            await onImport(contacts);
            reset();
        } catch (err) {
            // Error handled by parent
        }
    };

    const reset = () => {
        setFile(null);
        setCsvData([]);
        setHeaders([]);
        setStep("upload");
        setMapping({ name: "", email: "", phone: "" });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) reset();
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Import Contacts via CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file and map columns to contact fields.
                    </DialogDescription>
                </DialogHeader>

                {step === "upload" ? (
                    <div
                        className="mt-4 border-2 border-dashed rounded-xl p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".csv"
                            onChange={handleFileChange}
                        />
                        <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg">Click to upload or drag and drop</h3>
                        <p className="text-sm text-muted-foreground mt-1">CSV files only (max 500 contacts)</p>
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        <div className="flex items-center gap-2 text-sm bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30">
                            <Check className="h-4 w-4" />
                            File parsed successfully: {csvData.length} rows found.
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 items-center gap-4">
                                <Label>Name Column</Label>
                                <Select value={mapping.name} onValueChange={(val) => setMapping(prev => ({ ...prev, name: val }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select column..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- None --</SelectItem>
                                        {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 items-center gap-4">
                                <Label>Email Column</Label>
                                <Select value={mapping.email} onValueChange={(val) => setMapping(prev => ({ ...prev, email: val }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select column..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- None --</SelectItem>
                                        {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 items-center gap-4">
                                <Label>Phone Column</Label>
                                <Select value={mapping.phone} onValueChange={(val) => setMapping(prev => ({ ...prev, phone: val }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select column..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- None --</SelectItem>
                                        {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {!mapping.email && !mapping.phone && (
                            <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg dark:bg-amber-900/20 dark:text-amber-400">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                Please map at least one contact method (Email or Phone).
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => step === "mapping" ? setStep("upload") : onOpenChange(false)}>
                        {step === "mapping" ? "Back" : "Cancel"}
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={step === "upload" || isImporting || (!mapping.email && !mapping.phone)}
                    >
                        {isImporting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Importing...</>
                        ) : (
                            `Import ${csvData.length} Contacts`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
