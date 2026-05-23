"use client";

import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/components/customers/customer-table-types";

export function CustomerTablePagination({ table }: { table: Table<Customer> }) {
    return (
        <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-left text-xs text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="h-9 w-full rounded-lg border-border px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-muted sm:h-8 sm:w-auto"
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="h-9 w-full rounded-lg border-border px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-muted sm:h-8 sm:w-auto"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
