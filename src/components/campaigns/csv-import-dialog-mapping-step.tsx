"use client";

import { AlertCircle, Check } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { CsvImportMapping } from "./csv-import-dialog-types";

export function CsvImportDialogMappingStep({
    rowCount,
    headers,
    mapping,
    onMappingChange,
}: {
    rowCount: number;
    headers: string[];
    mapping: CsvImportMapping;
    onMappingChange: (patch: Partial<CsvImportMapping>) => void;
}) {
    return (
        <div className="space-y-6 py-4">
            <div className="flex items-center gap-2 text-sm bg-chart-2/10 text-chart-2 p-3 rounded-lg border border-chart-2/20 dark:bg-chart-2/20 dark:text-chart-2 dark:border-chart-2/30">
                <Check className="size-4" />
                File parsed successfully: {rowCount} rows found.
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 items-center gap-4">
                    <Label>Name Column</Label>
                    <Select value={mapping.name} onValueChange={(val) => onMappingChange({ name: val })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">-- None --</SelectItem>
                            {headers.map((h) => (
                                <SelectItem key={h} value={h}>
                                    {h}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 items-center gap-4">
                    <Label>Email Column</Label>
                    <Select value={mapping.email} onValueChange={(val) => onMappingChange({ email: val })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">-- None --</SelectItem>
                            {headers.map((h) => (
                                <SelectItem key={h} value={h}>
                                    {h}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 items-center gap-4">
                    <Label>Phone Column</Label>
                    <Select value={mapping.phone} onValueChange={(val) => onMappingChange({ phone: val })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">-- None --</SelectItem>
                            {headers.map((h) => (
                                <SelectItem key={h} value={h}>
                                    {h}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {!mapping.email && !mapping.phone && (
                <div className="flex items-start gap-2 text-xs text-chart-4 bg-chart-4/12 p-3 rounded-lg dark:bg-chart-4/20 dark:text-chart-4">
                    <AlertCircle className="shrink-0 mt-0.5 size-4" />
                    Please map at least one contact method (Email or Phone).
                </div>
            )}
        </div>
    );
}
