"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { FIELD_LABELS, REQUIRED_FIELDS, type RequiredField } from "./import-customers-constants";
import { parseImportCsvFile } from "./import-customers-csv";
import { submitCustomerImport } from "./import-customers-submit";

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith(".csv")) {
            toast.error("Please upload a valid CSV file.");
            return;
        }

        setFile(selectedFile);
        parseImportCsvFile(selectedFile, (headers, data, newMapping) => {
            setCsvHeaders(headers);
            setCsvData(data);
            setMapping(newMapping);
            setStep("map");
        });
    };

    const handleImport = () =>
        submitCustomerImport({
            csvData,
            mapping,
            setStep,
            setImportResults,
            setIsUploading,
        });

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
