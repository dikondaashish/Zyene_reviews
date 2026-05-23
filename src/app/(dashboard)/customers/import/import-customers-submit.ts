import { toast } from "sonner";
import type { RequiredField } from "./import-customers-constants";
import type { ImportStep } from "./use-import-customers";

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
}
