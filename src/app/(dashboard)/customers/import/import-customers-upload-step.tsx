"use client";

import { UploadCloud } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ImportUploadStep({
    fileInputRef,
    onFileSelect,
}: {
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload CSV File</CardTitle>
                <CardDescription>
                    Upload a CSV file containing your customer list. Your file should have a header row.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <button
                    type="button"
                    className="w-full border-2 border-dashed border-border rounded-lg p-8 sm:p-12 text-center hover:bg-muted transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <UploadCloud aria-hidden="true" className="mx-auto text-muted-foreground mb-4 size-12" />
                    <span className="block text-lg font-medium text-foreground">Choose a CSV file</span>
                    <span className="block text-sm text-muted-foreground mt-2">Select a file from your device</span>
                </button>
                    <input
                        aria-label="Choose customer CSV file"
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv"
                        onChange={onFileSelect}
                    />
            </CardContent>
        </Card>
    );
}
