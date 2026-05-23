"use client";

import { Upload } from "lucide-react";

export function CsvImportModalUpload({
    fileName,
    fileInputRef,
    onFileSelect,
}: {
    fileName: string | null;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-foreground/30 transition-colors"
        >
            <input ref={fileInputRef} type="file" accept=".csv" onChange={onFileSelect} className="hidden" />
            <Upload className="mx-auto text-muted-foreground mb-2 size-8" />
            <p className="font-medium text-sm">{fileName ? fileName : "Click to upload or drag and drop"}</p>
        </div>
    );
}
