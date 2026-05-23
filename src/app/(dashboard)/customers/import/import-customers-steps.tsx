"use client";

import Link from "next/link";
import {
    UploadCloud,
    FileText,
    CheckCircle2,
    AlertTriangle,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { useImportCustomers } from "./use-import-customers";

type ImportState = ReturnType<typeof useImportCustomers>;

export function ImportUploadStep({
    fileInputRef,
    onFileSelect,
}: {
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload CSV File</CardTitle>
                <CardDescription>
                    Upload a CSV file containing your customer list. Your file should have a header row.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">Click to upload CSV</h3>
                    <p className="text-sm text-muted-foreground mt-2">or drag and drop your file here</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv"
                        onChange={onFileSelect}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

export function ImportMapStep({
    state,
}: {
    state: ImportState;
}) {
    const { csvData, csvHeaders, mapping, setMapping, fieldLabels, requiredFields, handleImport, cancelMapping } = state;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Map Columns</CardTitle>
                    <CardDescription>
                        Match your CSV columns to the customer fields in Zyene Reviews.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium border border-primary/20">
                    <FileText className="h-4 w-4" />
                    {csvData.length} total rows
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-chart-4/12 border border-chart-4/35 rounded-md p-3 text-sm text-chart-4 flex gap-2">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-chart-4" />
                    <p>
                        You must map at least an <strong>Email</strong> or <strong>Phone Number</strong> so we can contact the customer.
                    </p>
                </div>

                <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/50">
                    {requiredFields.map((field) => (
                        <div key={field} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div className="font-medium text-foreground">
                                {fieldLabels[field]}
                                {(field === "email" || field === "phone") && (
                                    <span className="text-xs text-muted-foreground ml-2 font-normal">(Required one)</span>
                                )}
                            </div>
                            <Select
                                value={mapping[field]}
                                onValueChange={(val) => setMapping((prev) => ({ ...prev, [field]: val === "skip" ? "" : val }))}
                            >
                                <SelectTrigger className="bg-card">
                                    <SelectValue placeholder="Skip this field" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="skip" className="text-muted-foreground italic">
                                        Skip this field
                                    </SelectItem>
                                    {csvHeaders.map((header) => (
                                        <SelectItem key={header} value={header}>
                                            {header}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                </div>

                <div className="bg-muted border border-border rounded-lg p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Data Preview (First row)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mt-3">
                        {requiredFields.map((field) => {
                            const mappedHeader = mapping[field];
                            const sampleValue = mappedHeader && csvData[0] ? csvData[0][mappedHeader] : "---";
                            return (
                                <div key={field} className="bg-card p-2.5 rounded border border-border">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                                        {fieldLabels[field]}
                                    </p>
                                    <p className="font-medium truncate" title={sampleValue}>
                                        {sampleValue}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
                <Button variant="outline" onClick={cancelMapping}>
                    Cancel
                </Button>
                <Button onClick={handleImport} disabled={!mapping.email && !mapping.phone}>
                    Import Customers
                </Button>
            </CardFooter>
        </Card>
    );
}

export function ImportingStep() {
    return (
        <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <h3 className="text-xl font-semibold">Importing Customers...</h3>
                <p className="text-muted-foreground mt-2">Please wait while we process your file. This may take a minute.</p>
            </CardContent>
        </Card>
    );
}

export function ImportSuccessStep({
    importResults,
    onImportAnother,
}: {
    importResults: { total: number; success: number; failed: number };
    onImportAnother: () => void;
}) {
    return (
        <Card className="border-chart-2/30">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 bg-chart-2/15 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-chart-2" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Import Complete!</h3>

                <div className="flex items-center justify-center gap-6 mt-6 p-4 bg-muted/50 rounded-xl border w-full max-w-sm">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-foreground">{importResults.success}</p>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Imported</p>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="text-center">
                        <p className="text-3xl font-bold text-foreground">{importResults.failed}</p>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Failed/Skipped</p>
                    </div>
                </div>

                {importResults.failed > 0 && (
                    <p className="text-sm text-chart-4 mt-4 max-w-md">
                        Some rows were skipped because they either already exist or were missing valid contact information.
                    </p>
                )}

                <div className="mt-8 flex gap-3">
                    <Button asChild>
                        <Link href="/customers">View Customers</Link>
                    </Button>
                    <Button variant="outline" onClick={onImportAnother}>
                        Import Another File
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
