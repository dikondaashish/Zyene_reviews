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
                <div
                    className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">Click to upload CSV</h3>
                    <p className="text-sm text-muted-foreground mt-2">or drag and drop your file here</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv"
                        onChange={onFileSelect}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
