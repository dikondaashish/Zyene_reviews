"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/components/customers/customer-table-types";

export function CustomerTablePagination({ table }: { table: Table<Customer> }) {
    const { pageIndex, pageSize } = table.getState().pagination;
    const total = table.getFilteredRowModel().rows.length;
    const selected = table.getFilteredSelectedRowModel().rows.length;
    const start = total === 0 ? 0 : pageIndex * pageSize + 1;
    const end = Math.min((pageIndex + 1) * pageSize, total);
    const pages = Math.max(1, table.getPageCount());

    return (
        <nav aria-label="Customers pagination" className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p aria-live="polite" className="text-xs tabular-nums text-muted-foreground">
                {start}–{end} of {total.toLocaleString()} customers{selected > 0 && ` · ${selected} selected`}
            </p>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:flex">
                <Button variant="outline" size="sm" className="h-11 sm:h-9" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    <ChevronLeft aria-hidden="true" className="size-4" />Previous
                </Button>
                <span className="text-xs tabular-nums text-muted-foreground">Page {pageIndex + 1} of {pages}</span>
                <Button variant="outline" size="sm" className="h-11 sm:h-9" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    Next<ChevronRight aria-hidden="true" className="size-4" />
                </Button>
            </div>
        </nav>
    );
}
