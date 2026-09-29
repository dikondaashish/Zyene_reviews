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
        <div className="mt-4">
        <button
            type="button"
            className="w-full border-2 border-dashed rounded-xl p-8 sm:p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            onClick={() => fileInputRef.current?.click()}
        >
            <span className="bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 size-12">
                <Upload aria-hidden="true" className="text-primary size-6" />
            </span>
            <span className="block font-semibold text-lg">Choose a CSV file</span>
            <span className="block text-sm text-muted-foreground mt-1">CSV files only (max 500 contacts)</span>
        </button>
            <input
                aria-label="Choose campaign contacts CSV file"
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={onFileChange}
            />
        </div>
    );
}
