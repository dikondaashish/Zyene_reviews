"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ImportSuccessStep({
    importResults,
    onImportAnother,
}: {
    importResults: { total: number; success: number; failed: number };
    onImportAnother: () => void;
}) {
    return (
        <Card className="border-chart-2/30">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <div className="bg-chart-2/15 rounded-full flex items-center justify-center mb-4 size-16">
                    <CheckCircle2 className="text-chart-2 size-8" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Import Complete!</h3>

                <div className="flex items-center justify-center gap-6 mt-6 p-4 bg-muted/50 rounded-xl border w-full max-w-sm">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-foreground">{importResults.success}</p>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Imported
                        </p>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="text-center">
                        <p className="text-3xl font-bold text-foreground">{importResults.failed}</p>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Failed/Skipped
                        </p>
                    </div>
                </div>

                {importResults.failed > 0 && (
                    <p className="text-sm text-chart-4 mt-4 max-w-md">
                        Some rows were skipped because they either already exist or were missing valid
                        contact information.
                    </p>
                )}

                <div className="mt-8 flex gap-3">
                    <Button asChild>
                        <Link href="/customers">View Customers</Link>
                    </Button>
                    <Button variant="outline" onClick={onImportAnother}>
                        Import Another File
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
