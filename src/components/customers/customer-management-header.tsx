"use client";

import { Upload, Download, UserPlus, Users } from "lucide-react";
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
                    Manage your customer database and trigger review campaigns.
                </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:w-auto sm:justify-end">
                <Button
                    variant="outline"
                    onClick={onImportClick}
                    className="h-9 w-full rounded-lg border-border px-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 sm:w-auto sm:flex-1 sm:flex-initial md:px-4"
                >
                    <Upload className="shrink-0 md:mr-2 size-4" />
                    <span className="md:hidden">Import</span>
                    <span className="hidden md:inline">Import CSV</span>
                </Button>
                <Button
                    variant="outline"
                    onClick={onExportClick}
                    disabled={isExporting}
                    className="h-9 w-full rounded-lg border-border px-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 sm:w-auto sm:flex-1 sm:flex-initial md:px-4"
                >
                    <Download className="shrink-0 md:mr-2 size-4" />
                    <span className="md:hidden">Export</span>
                    <span className="hidden md:inline">Export CSV</span>
                </Button>
                <Button
                    onClick={onAddClick}
                    className="h-9 w-full rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 sm:w-auto sm:flex-1 sm:flex-initial md:px-4"
                >
                    <UserPlus className="shrink-0 md:mr-2 size-4" />
                    <span className="md:hidden">Add</span>
                    <span className="hidden md:inline">Add Customer</span>
                </Button>
            </div>
        </div>
    );
}
