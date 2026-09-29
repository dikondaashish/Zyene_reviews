"use client";

import { Upload, Download, UserPlus, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CustomerManagementHeader({
    onImportClick,
    onExportClick,
    onAddClick,
    isExporting,
}: {
    onImportClick: () => void;
    onExportClick: () => void;
    onAddClick: () => void;
    isExporting: boolean;
}) {
    return (
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start sm:gap-5 lg:items-end">
            <div className="min-w-0 flex-1 space-y-1">
                <div className="mb-1 flex items-center gap-2">
                    <div className="rounded-lg border border-primary/20 bg-primary/10 p-1.5">
                        <Users className="text-primary size-4" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">Customers</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                    Keep your contacts organized and ready for your next campaign.
                </p>
                <details className="text-xs text-muted-foreground">
                    <summary className="w-fit cursor-pointer py-1 focus-visible:outline-2 focus-visible:outline-ring">Using test contacts</summary>
                    <p className="max-w-prose py-1 leading-relaxed">Add the tag <code>zyene:test</code> to exclude a contact from sends and customer metrics. Remove it to include them again.</p>
                </details>
            </div>

            <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:w-auto sm:justify-end">
                <Button
                    variant="outline"
                    onClick={onImportClick}
                    className="h-11 sm:h-9 w-full rounded-lg border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 sm:w-auto sm:flex-1 sm:flex-initial md:px-4"
                >
                    <Upload className="shrink-0 md:mr-2 size-4" />
                    <span className="md:hidden">Import</span>
                    <span className="hidden md:inline">Import CSV</span>
                </Button>
                <Button
                    variant="outline"
                    onClick={onExportClick}
                    disabled={isExporting}
                    className="h-11 sm:h-9 w-full rounded-lg border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 sm:w-auto sm:flex-1 sm:flex-initial md:px-4"
                >
                    {isExporting ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Download className="shrink-0 md:mr-2 size-4" />}
                    <span className="md:hidden">{isExporting ? "Exporting…" : "Export"}</span>
                    <span className="hidden md:inline">{isExporting ? "Exporting…" : "Export CSV"}</span>
                </Button>
                <Button
                    onClick={onAddClick}
                    className="h-11 sm:h-9 w-full rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto sm:flex-1 sm:flex-initial md:px-4"
                >
                    <UserPlus className="shrink-0 md:mr-2 size-4" />
                    <span className="md:hidden">Add</span>
                    <span className="hidden md:inline">Add Customer</span>
                </Button>
            </div>
        </div>
    );
}
