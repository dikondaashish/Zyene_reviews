"use client";

import { ShieldCheck } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { CsvImportModalRow } from "./csv-import-modal-types";

export function CsvImportModalPreview({
    csvData,
    hasConsent,
    onConsentChange,
}: {
    csvData: CsvImportModalRow[];
    hasConsent: boolean;
    onConsentChange: (value: boolean) => void;
}) {
    if (csvData.length === 0) return null;

    return (
        <div className="space-y-3">
            <div className="bg-muted rounded-lg p-3 max-h-32 overflow-y-auto text-xs border border-border">
                <table className="w-full">
                    <tbody>
                        {csvData.slice(0, 3).map((row, idx) => (
                            <tr key={idx} className="border-b last:border-0">
                                <td className="py-1 pr-2 truncate font-medium">{row.name || "—"}</td>
                                <td className="py-1 truncate text-muted-foreground">{row.email || "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 space-y-3">
                <div className="flex gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">Compliance Acknowledgment</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            I certify that I have obtained express consent to contact these individuals via SMS/Email in
                            accordance with TCPA/CAN-SPAM.
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 pt-1 border-t border-primary/20">
                    <Checkbox id="consent" checked={hasConsent} onCheckedChange={(v) => onConsentChange(v === true)} />
                    <Label htmlFor="consent" className="text-xs font-medium text-foreground cursor-pointer">
                        I confirm I have explicit consent.
                    </Label>
                </div>
            </div>
        </div>
    );
}
