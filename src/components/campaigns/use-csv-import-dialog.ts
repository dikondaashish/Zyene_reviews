"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";

import type { CsvContactRow, CsvImportDialogProps, CsvImportMapping } from "./csv-import-dialog-types";

export function useCsvImportDialog({
    onOpenChange,
    onImport,
}: Pick<CsvImportDialogProps, "onOpenChange" | "onImport">) {
    const [file, setFile] = useState<File | null>(null);
    const [csvData, setCsvData] = useState<CsvContactRow[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [step, setStep] = useState<"upload" | "mapping">("upload");
    const [mapping, setMapping] = useState<CsvImportMapping>({
        name: "",
        email: "",
        phone: "",
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setFile(null);
        setCsvData([]);
        setHeaders([]);
        setStep("upload");
        setMapping({ name: "", email: "", phone: "" });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const parseCSV = (selectedFile: File) => {
        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsedRows = results.data as CsvContactRow[];
                if (parsedRows.length > 0) {
                    setCsvData(parsedRows);
                    const cols = Object.keys(parsedRows[0] as object);
                    setHeaders(cols);

                    const newMapping: CsvImportMapping = { name: "", email: "", phone: "" };
                    cols.forEach((col) => {
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
            },
        });
    };

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

    const handleImport = async () => {
        if (!mapping.email && !mapping.phone) {
            toast.error("Please map at least Email or Phone column");
            return;
        }

        const contacts = csvData.reduce<
            Array<{ name?: string; email?: string; phone?: string }>
        >((acc, row) => {
            const contact = {
                name: mapping.name ? row[mapping.name] : undefined,
                email: mapping.email ? row[mapping.email] : undefined,
                phone: mapping.phone ? row[mapping.phone] : undefined,
            };
            if (contact.email || contact.phone) acc.push(contact);
            return acc;
        }, []);

        if (contacts.length === 0) {
            toast.error("No valid contacts found in CSV");
            return;
        }

        try {
            await onImport(contacts);
            reset();
        } catch {
            // Error handled by parent
        }
    };

    const handleOpenChange = (val: boolean) => {
        if (!val) reset();
        onOpenChange(val);
    };

    return {
        file,
        csvData,
        headers,
        step,
        setStep,
        mapping,
        setMapping,
        fileInputRef,
        handleFileChange,
        handleImport,
        handleOpenChange,
    };
}
