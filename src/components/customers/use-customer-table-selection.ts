"use client";

import * as React from "react";
import type { RowSelectionState, Table } from "@tanstack/react-table";
import type { Customer } from "@/components/customers/customer-table-types";

/**
 * Row selection keyed by customer id (see `getRowId` on the table). It resets
 * whenever the visible set of customers changes, e.g. switching group or
 * searching, so ticks never land on different people than the owner chose,
 * and when `clearSignal` changes (the bulk bar's Clear button).
 */
export function useCustomerTableSelection(data: Customer[], clearSignal: number | undefined) {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const visibleIds = data.map((c) => c.id).join(",");
    const [resetKey, setResetKey] = React.useState(`${visibleIds}|${clearSignal ?? 0}`);
    const nextKey = `${visibleIds}|${clearSignal ?? 0}`;
    if (nextKey !== resetKey) {
        // Adjusting state while rendering (React's documented pattern) avoids a stale frame.
        setResetKey(nextKey);
        setRowSelection({});
    }
    return [rowSelection, setRowSelection] as const;
}

/** Tells the parent which customers are ticked whenever the selection changes. */
export function useReportCustomerSelection(
    table: Table<Customer>,
    rowSelection: RowSelectionState,
    onSelectionChange: ((ids: string[]) => void) | undefined,
) {
    React.useEffect(() => {
        onSelectionChange?.(table.getFilteredSelectedRowModel().rows.map((row) => row.original.id));
    }, [rowSelection, table, onSelectionChange]);
}
