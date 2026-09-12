"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { FormValues } from "@/app/(dashboard)/requests/send-request-dialog-schema";
import type { RequestPreview } from "@/app/(dashboard)/requests/send-request-preview";

export function useRequestPreview(businessId: string) {
    const [preview, setPreview] = useState<{ data: RequestPreview; values: FormValues } | null>(null);
    const [loading, setLoading] = useState(false);
    async function prepare(values: FormValues) {
        setLoading(true);
        try {
            const response = await fetch("/api/requests/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessId, customerName: values.customerName }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Could not prepare preview");
            setPreview({ data, values });
        } catch (err) { toast.error(err instanceof Error ? err.message : "Could not prepare preview"); }
        finally { setLoading(false); }
    }
    return { preview, loading, prepare, clear: () => setPreview(null) };
}
