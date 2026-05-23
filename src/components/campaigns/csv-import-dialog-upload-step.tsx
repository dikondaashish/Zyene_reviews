"use client";

import { Upload } from "lucide-react";

export function CsvImportDialogUploadStep({
    fileInputRef,
    onFileChange,
}: {
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div
            className="mt-4 border-2 border-dashed rounded-xl p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={onFileChange}
            />
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Click to upload or drag and drop</h3>
            <p className="text-sm text-muted-foreground mt-1">CSV files only (max 500 contacts)</p>
        </div>
    );
}
