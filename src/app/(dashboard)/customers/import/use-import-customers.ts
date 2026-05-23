"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import Papa from "papaparse";
import { FIELD_LABELS, REQUIRED_FIELDS, type RequiredField } from "./import-customers-constants";

export type ImportStep = "upload" | "map" | "importing" | "success";

export function useImportCustomers() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
    const [mapping, setMapping] = useState<Record<RequiredField, string>>({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
    });
    const [isUploading, setIsUploading] = useState(false);
    const [step, setStep] = useState<ImportStep>("upload");
    const [importResults, setImportResults] = useState<{ total: number; success: number; failed: number } | null>(null);

    const parseCSV = (selectedFile: File) => {
        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const headers = results.meta.fields || [];
                setCsvHeaders(headers);
                setCsvData(results.data as Record<string, string>[]);

                const newMapping: Record<RequiredField, string> = {
                    first_name: "",
                    last_name: "",
                    email: "",
                    phone: "",
                };

                headers.forEach((header) => {
                    const lowerHeader = header.toLowerCase();
                    if (lowerHeader.includes("first") && lowerHeader.includes("name")) {
                        newMapping.first_name = header;
                    } else if (lowerHeader.includes("last") && lowerHeader.includes("name")) {
                        newMapping.last_name = header;
                    } else if (lowerHeader.includes("name") && !newMapping.first_name) {
                        newMapping.first_name = header;
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
            },
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith(".csv")) {
            toast.error("Please upload a valid CSV file.");
            return;
        }

        setFile(selectedFile);
        parseCSV(selectedFile);
    };

    const handleImport = async () => {
        if (!mapping.email && !mapping.phone) {
            toast.error("You must map at least an Email or Phone number to import customers.");
            return;
        }

        setIsUploading(true);
        setStep("importing");

        try {
            const payload = csvData
                .map((row) => ({
                    first_name: mapping.first_name ? row[mapping.first_name] : null,
                    last_name: mapping.last_name ? row[mapping.last_name] : null,
                    email: mapping.email ? row[mapping.email] : null,
                    phone: mapping.phone ? row[mapping.phone] : null,
                }))
                .filter((c) => c.email || c.phone);

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
                failed: payload.length - data.successCount,
            });
            setStep("success");
            toast.success(`Successfully imported ${data.successCount} customers!`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(message);
            setStep("map");
        } finally {
            setIsUploading(false);
        }
    };

    const resetUpload = () => {
        setStep("upload");
        setFile(null);
        setImportResults(null);
    };

    const cancelMapping = () => {
        setStep("upload");
        setFile(null);
    };

    return {
        fileInputRef,
        file,
        csvHeaders,
        csvData,
        mapping,
        setMapping,
        isUploading,
        step,
        importResults,
        handleFileSelect,
        handleImport,
        resetUpload,
        cancelMapping,
        fieldLabels: FIELD_LABELS,
        requiredFields: REQUIRED_FIELDS,
    };
}
