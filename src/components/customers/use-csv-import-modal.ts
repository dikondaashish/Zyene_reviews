"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { toast } from "sonner";

import type { CsvImportModalProps, CsvImportModalRow } from "./csv-import-modal-types";

export function useCsvImportModal({
    onOpenChange,
    onSuccess,
}: Pick<CsvImportModalProps, "onOpenChange" | "onSuccess">) {
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [csvData, setCSVData] = useState<CsvImportModalRow[]>([]);
    const [hasConsent, setHasConsent] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const resetState = () => {
        setFileName(null);
        setCSVData([]);
        setHasConsent(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

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
                setCSVData(results.data as CsvImportModalRow[]);
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
            await onSuccess?.();
            router.refresh();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to import customers");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (val: boolean) => {
        if (!val) resetState();
        onOpenChange(val);
    };

    return {
        isLoading,
        fileName,
        csvData,
        hasConsent,
        setHasConsent,
        fileInputRef,
        handleFileSelect,
        handleImport,
        handleOpenChange,
    };
}
