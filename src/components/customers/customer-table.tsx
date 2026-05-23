"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { buildCustomerTableColumns } from "@/components/customers/build-customer-table-columns";
import { CustomerDeleteDialog } from "@/components/customers/customer-delete-dialog";
import { CustomerTableDesktop } from "@/components/customers/customer-table-desktop";
import { CustomerTableMobileList } from "@/components/customers/customer-table-mobile-list";
import { CustomerTablePagination } from "@/components/customers/customer-table-pagination";
import { useCustomerTableMutations } from "@/components/customers/use-customer-table-mutations";
import type { Customer, CustomerTableProps } from "@/components/customers/customer-table-types";

export type { Customer } from "@/components/customers/customer-table-types";

export function CustomerTable({
    data,
    businessId,
    onDelete,
    onCustomerUpdated,
    onSendRequest,
    onSelectionChange,
}: CustomerTableProps) {
    const router = useRouter();
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [deleteTarget, setDeleteTarget] = React.useState<Customer | null>(null);

    const { editingNameId, setEditingNameId, saveName, saveTags, setOptedOut } =
        useCustomerTableMutations(businessId, onCustomerUpdated);

    const showVisitsSpend = React.useMemo(
        () => data.some((c) => (c.visit_count ?? 0) > 0 || (c.total_spend_cents ?? 0) > 0),
        [data]
    );

    const handleRowNavigate = React.useCallback(
        (e: React.MouseEvent, customerId: string) => {
            const el = e.target as HTMLElement;
            if (
                el.closest("button") ||
                el.closest("a") ||
                el.closest("input") ||
                el.closest('[role="checkbox"]') ||
                el.closest("[data-radix-dropdown-menu-content]") ||
                el.closest("[data-radix-popper-content-wrapper]") ||
                el.closest('[data-slot="popover-content"]') ||
                el.closest('[data-slot="select-content"]')
            ) {
                return;
            }
            router.push(`/customers/${customerId}`);
        },
        [router]
    );

    const columns = React.useMemo(
        () =>
            buildCustomerTableColumns({
                editingNameId,
                setEditingNameId,
                showVisitsSpend,
                saveName,
                saveTags,
                setOptedOut,
                onSendRequest,
                setDeleteTarget,
            }),
        [editingNameId, onSendRequest, saveName, saveTags, setOptedOut, showVisitsSpend]
    );

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: { sorting, columnFilters, columnVisibility, rowSelection },
    });

    React.useEffect(() => {
        if (onSelectionChange) {
            onSelectionChange(table.getFilteredSelectedRowModel().rows.map((row) => row.original.id));
        }
    }, [rowSelection, table, onSelectionChange]);

    return (
        <div className="min-w-0 w-full">
            <CustomerTableMobileList
                table={table}
                router={router}
                showVisitsSpend={showVisitsSpend}
                saveTags={saveTags}
                setEditingNameId={setEditingNameId}
                onSendRequest={onSendRequest}
                setDeleteTarget={setDeleteTarget}
                setOptedOut={setOptedOut}
                handleRowNavigate={handleRowNavigate}
            />
            <CustomerTableDesktop
                table={table}
                columnCount={columns.length}
                handleRowNavigate={handleRowNavigate}
                onRowActivate={(id) => router.push(`/customers/${id}`)}
            />
            <CustomerTablePagination table={table} />
            <CustomerDeleteDialog
                deleteTarget={deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget && onDelete) {
                        onDelete(deleteTarget.id);
                    }
                    setDeleteTarget(null);
                }}
            />
        </div>
    );
}
