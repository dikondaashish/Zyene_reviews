import { toast } from "sonner";
import type { RequiredField } from "./import-customers-constants";
import type { ImportStep } from "./use-import-customers";

type ImportRow = { first_name?: string; last_name?: string; email?: string; phone?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * One CSV row as the import API expects it: only mapped, non-empty, trimmed fields
 * (the schema rejects `null` and blank emails). A malformed email is dropped so the
 * row can still import by phone; a row with neither is skipped.
 */
export function buildImportRow(
    row: Record<string, string>,
    mapping: Record<RequiredField, string>,
): ImportRow | null {
    const read = (field: RequiredField, max: number) => {
        const column = mapping[field];
        const value = column ? (row[column] ?? "").trim() : "";
        return value ? value.slice(0, max) : undefined;
    };
    const email = read("email", 255);
    const customer: ImportRow = {
        first_name: read("first_name", 100),
        last_name: read("last_name", 100),
        email: email && EMAIL_PATTERN.test(email) ? email : undefined,
        phone: read("phone", 30),
    };
    if (!customer.email && !customer.phone) return null;
    return Object.fromEntries(Object.entries(customer).filter(([, v]) => v !== undefined)) as ImportRow;
}

export async function submitCustomerImport(params: {
    csvData: Record<string, string>[];
    mapping: Record<RequiredField, string>;
    setStep: (step: ImportStep) => void;
    setImportResults: (r: { total: number; success: number; failed: number }) => void;
    setIsUploading: (v: boolean) => void;
}) {
    const { csvData, mapping, setStep, setImportResults, setIsUploading } = params;

    if (!mapping.email && !mapping.phone) {
        toast.error("You must map at least an Email or Phone number to import customers.");
        return;
    }

    setIsUploading(true);
    setStep("importing");

    try {
        const payload = csvData.reduce<ImportRow[]>((acc, row) => {
            const customer = buildImportRow(row, mapping);
            if (customer) acc.push(customer);
            return acc;
        }, []);

        if (payload.length === 0) {
            throw new Error("No rows have a valid email or phone number.");
        }

        const res = await fetch("/api/customers/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customers: payload }),
        });

        const data = (await res.json()) as { error?: string; imported?: number };

        if (!res.ok) {
            throw new Error(data.error || "Failed to import customers");
        }

        const imported = typeof data.imported === "number" ? data.imported : 0;
        setImportResults({
            total: csvData.length,
            success: imported,
            failed: csvData.length - imported,
        });
        setStep("success");
        toast.success(`Successfully imported ${imported} customers!`);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        toast.error(message);
        setStep("map");
    } finally {
        setIsUploading(false);
    }
}
