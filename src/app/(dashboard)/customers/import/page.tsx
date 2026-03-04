"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UploadCloud, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import Papa from "papaparse";

const REQUIRED_FIELDS = ["first_name", "last_name", "email", "phone"] as const;
type RequiredField = typeof REQUIRED_FIELDS[number];

const FIELD_LABELS: Record<RequiredField, string> = {
    first_name: "First Name",
    last_name: "Last Name",
    email: "Email Address",
    phone: "Phone Number"
};

export default function ImportCustomersPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvData, setCsvData] = useState<any[]>([]);
    const [mapping, setMapping] = useState<Record<RequiredField, string>>({
        first_name: "",
        last_name: "",
        email: "",
        phone: ""
    });
    const [isUploading, setIsUploading] = useState(false);
    const [step, setStep] = useState<"upload" | "map" | "importing" | "success">("upload");
    const [importResults, setImportResults] = useState<{ total: number; success: number; failed: number } | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv')) {
            toast.error("Please upload a valid CSV file.");
            return;
        }

        setFile(selectedFile);
        parseCSV(selectedFile);
    };

    const parseCSV = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const headers = results.meta.fields || [];
                setCsvHeaders(headers);
                setCsvData(results.data);

                // Auto-map columns based on common names
                const newMapping: Record<RequiredField, string> = {
                    first_name: "",
                    last_name: "",
                    email: "",
                    phone: ""
                };

                headers.forEach(header => {
                    const lowerHeader = header.toLowerCase();
                    if (lowerHeader.includes("first") && lowerHeader.includes("name")) {
                        newMapping.first_name = header;
                    } else if (lowerHeader.includes("last") && lowerHeader.includes("name")) {
                        newMapping.last_name = header;
                    } else if (lowerHeader.includes("name") && !newMapping.first_name) {
                        newMapping.first_name = header; // Fallback
                    } else if (lowerHeader.includes("email")) {
                        newMapping.email = header;
                    } else if (lowerHeader.includes("phone")) {
                        newMapping.phone = header;
                    }
                });

                setMapping(newMapping);
                setStep("map");
            },
            error: (error) => {
                toast.error(`Error parsing CSV: ${error.message}`);
            }
        });
    };

    const handleImport = async () => {
        // Validate mapping
        if (!mapping.email && !mapping.phone) {
            toast.error("You must map at least an Email or Phone number to import customers.");
            return;
        }

        setIsUploading(true);
        setStep("importing");

        try {
            // Transform data according to mapping
            const payload = csvData.map(row => ({
                first_name: mapping.first_name ? row[mapping.first_name] : null,
                last_name: mapping.last_name ? row[mapping.last_name] : null,
                email: mapping.email ? row[mapping.email] : null,
                phone: mapping.phone ? row[mapping.phone] : null,
            })).filter(c => c.email || c.phone); // Filter out empty rows

            const res = await fetch("/api/customers/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customers: payload }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to import customers");
            }

            setImportResults({
                total: payload.length,
                success: data.successCount,
                failed: payload.length - data.successCount
            });
            setStep("success");
            toast.success(`Successfully imported ${data.successCount} customers!`);

        } catch (error: any) {
            toast.error(error.message);
            setStep("map");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/customers">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Import Customers</h2>
            </div>

            {step === "upload" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upload CSV File</CardTitle>
                        <CardDescription>
                            Upload a CSV file containing your customer list. Your file should have a header row.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Click to upload CSV</h3>
                            <p className="text-sm text-slate-500 mt-2">or drag and drop your file here</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".csv"
                                onChange={handleFileSelect}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === "map" && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Map Columns</CardTitle>
                            <CardDescription>
                                Match your CSV columns to the customer fields in Zyene Reviews.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium border border-blue-200">
                            <FileText className="h-4 w-4" />
                            {csvData.length} total rows
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800 flex gap-2">
                            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                            <p>You must map at least an <strong>Email</strong> or <strong>Phone Number</strong> so we can contact the customer.</p>
                        </div>

                        <div className="space-y-4 border rounded-lg p-4 bg-slate-50/50">
                            {REQUIRED_FIELDS.map((field) => (
                                <div key={field} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                    <div className="font-medium text-slate-700">
                                        {FIELD_LABELS[field]}
                                        {(field === "email" || field === "phone") && (
                                            <span className="text-xs text-slate-400 ml-2 font-normal">(Required one)</span>
                                        )}
                                    </div>
                                    <Select
                                        value={mapping[field]}
                                        onValueChange={(val) => setMapping(prev => ({ ...prev, [field]: val === "skip" ? "" : val }))}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Skip this field" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="skip" className="text-slate-400 italic">Skip this field</SelectItem>
                                            {csvHeaders.map(header => (
                                                <SelectItem key={header} value={header}>{header}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-50 border rounded-lg p-4 space-y-2">
                            <h4 className="text-sm font-semibold text-slate-700">Data Preview (First row)</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mt-3">
                                {REQUIRED_FIELDS.map(field => {
                                    const mappedHeader = mapping[field];
                                    const sampleValue = mappedHeader && csvData[0] ? csvData[0][mappedHeader] : "---";
                                    return (
                                        <div key={field} className="bg-white p-2.5 rounded border border-slate-200 shadow-sm">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">{FIELD_LABELS[field]}</p>
                                            <p className="font-medium truncate" title={sampleValue}>{sampleValue}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-6">
                        <Button variant="outline" onClick={() => { setStep("upload"); setFile(null); }}>
                            Cancel
                        </Button>
                        <Button onClick={handleImport} disabled={!mapping.email && !mapping.phone}>
                            Import Customers
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {step === "importing" && (
                <Card>
                    <CardContent className="py-12 flex flex-col items-center justify-center">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                        <h3 className="text-xl font-semibold">Importing Customers...</h3>
                        <p className="text-muted-foreground mt-2">Please wait while we process your file. This may take a minute.</p>
                    </CardContent>
                </Card>
            )}

            {step === "success" && importResults && (
                <Card className="border-green-200">
                    <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Import Complete!</h3>

                        <div className="flex items-center justify-center gap-6 mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 w-full max-w-sm">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-slate-900">{importResults.success}</p>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Imported</p>
                            </div>
                            <div className="w-px h-10 bg-slate-200"></div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-slate-900">{importResults.failed}</p>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Failed/Skipped</p>
                            </div>
                        </div>

                        {importResults.failed > 0 && (
                            <p className="text-sm text-amber-600 mt-4 max-w-md">
                                Some rows were skipped because they either already exist or were missing valid contact information.
                            </p>
                        )}

                        <div className="mt-8 flex gap-3">
                            <Button asChild>
                                <Link href="/customers">View Customers</Link>
                            </Button>
                            <Button variant="outline" onClick={() => { setStep("upload"); setFile(null); setImportResults(null); }}>
                                Import Another File
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
