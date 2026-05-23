"use client";

import { FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { useImportCustomers } from "./use-import-customers";

type ImportState = ReturnType<typeof useImportCustomers>;

export function ImportMapStep({ state }: { state: ImportState }) {
    const {
        csvData,
        csvHeaders,
        mapping,
        setMapping,
        fieldLabels,
        requiredFields,
        handleImport,
        cancelMapping,
    } = state;

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
                    <FileText className="size-4" />
                    {csvData.length} total rows
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-chart-4/12 border border-chart-4/35 rounded-md p-3 text-sm text-chart-4 flex gap-2">
                    <AlertTriangle className="shrink-0 text-chart-4 size-5" />
                    <p>
                        You must map at least an <strong>Email</strong> or <strong>Phone Number</strong> so
                        we can contact the customer.
                    </p>
                </div>

                <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/50">
                    {requiredFields.map((field) => (
                        <div key={field} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div className="font-medium text-foreground">
                                {fieldLabels[field]}
                                {(field === "email" || field === "phone") && (
                                    <span className="text-xs text-muted-foreground ml-2 font-normal">
                                        (Required one)
                                    </span>
                                )}
                            </div>
                            <Select
                                value={mapping[field]}
                                onValueChange={(val) =>
                                    setMapping((prev) => ({ ...prev, [field]: val === "skip" ? "" : val }))
                                }
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
                            const sampleValue =
                                mappedHeader && csvData[0] ? csvData[0][mappedHeader] : "---";
                            return (
                                <div
                                    key={field}
                                    className="bg-card p-2.5 rounded border border-border"
                                >
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
