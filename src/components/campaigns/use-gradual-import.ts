"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { summarizeImportRows, validateImportRows, type RawImportRow } from "@/lib/enrollment/validate-import-rows";
import type { ImportProgress } from "@/services/enrollment/import-progress";

type Channel = "sms" | "email" | "both";

function pickColumn(cols: string[], test: (c: string) => boolean) {
    return cols.find((c) => test(c.toLowerCase())) ?? "";
}

/** CSV parse + the same validation the server runs, plus import progress polling. */
export function useGradualImport(campaignId: string, channel: Channel) {
    const [fileName, setFileName] = useState<string | null>(null);
    const [rawRows, setRawRows] = useState<RawImportRow[]>([]);
    const [dailyLimit, setDailyLimit] = useState(25);
    const [consent, setConsent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [imports, setImports] = useState<ImportProgress[]>([]);

    const preview = useMemo(() => validateImportRows(rawRows, channel), [rawRows, channel]);
    const summary = useMemo(() => summarizeImportRows(preview), [preview]);

    const refresh = useCallback(async () => {
        const response = await fetch(`/api/campaigns/${campaignId}/imports`);
        const body = await response.json().catch(() => null) as { data?: { imports?: ImportProgress[] } } | null;
        if (response.ok) setImports(body?.data?.imports ?? []);
    }, [campaignId]);

    useEffect(() => { void refresh(); }, [refresh]);

    const parseFile = (file: File) => {
        setFileName(file.name);
        Papa.parse<Record<string, string>>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const cols = results.meta.fields ?? [];
                const name = pickColumn(cols, (c) => c.includes("name") || c === "customer");
                const email = pickColumn(cols, (c) => c.includes("email") || c === "mail");
                const phone = pickColumn(cols, (c) => c.includes("phone") || c === "tel" || c === "mobile");
                if (!email && !phone) {
                    toast.error("The file needs an email or phone column");
                    return;
                }
                setRawRows(results.data.map((r) => ({ name: name ? r[name] : null, email: email ? r[email] : null, phone: phone ? r[phone] : null })));
            },
            error: (err) => toast.error(`Could not read the CSV: ${err.message}`),
        });
    };

    const reset = () => { setFileName(null); setRawRows([]); setConsent(false); };

    const submit = async () => {
        setSubmitting(true);
        try {
            const response = await fetch(`/api/campaigns/${campaignId}/imports`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName, dailyLimit, consentConfirmed: consent, rows: rawRows }),
            });
            const body = await response.json().catch(() => null) as { error?: string } | null;
            if (!response.ok) {
                toast.error(body?.error || "Could not start the import");
                return;
            }
            toast.success(`Import started: up to ${dailyLimit} contacts per day`);
            reset();
            await refresh();
        } finally {
            setSubmitting(false);
        }
    };

    const update = async (importId: string, patch: { status?: string; dailyLimit?: number }) => {
        const response = await fetch(`/api/campaigns/${campaignId}/imports/${importId}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch),
        });
        const body = await response.json().catch(() => null) as { error?: string } | null;
        if (!response.ok) toast.error(body?.error || "Could not update the import");
        await refresh();
    };

    return { fileName, preview, summary, dailyLimit, setDailyLimit, consent, setConsent, submitting, imports, parseFile, reset, submit, update };
}
