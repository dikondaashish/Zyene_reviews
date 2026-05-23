import Papa from "papaparse";
import { toast } from "sonner";
import type { RequiredField } from "./import-customers-constants";

export function parseImportCsvFile(
    selectedFile: File,
    onParsed: (headers: string[], data: Record<string, string>[], mapping: Record<RequiredField, string>) => void
) {
    Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            const headers = results.meta.fields || [];
            const data = results.data as Record<string, string>[];

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

            onParsed(headers, data, newMapping);
        },
        error: (error) => {
            toast.error(`Error parsing CSV: ${error.message}`);
        },
    });
}
