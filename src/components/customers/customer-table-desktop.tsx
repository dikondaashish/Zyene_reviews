"use client";

import type { Table as TanstackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { Customer } from "@/components/customers/customer-table-types";

export function CustomerTableDesktop({
    table,
    columnCount,
    handleRowNavigate,
    onRowActivate,
}: {
    table: TanstackTable<Customer>;
    columnCount: number;
    handleRowNavigate: (e: React.MouseEvent, customerId: string) => void;
    onRowActivate: (customerId: string) => void;
}) {
    return (
        <div className="hidden overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-sm lg:block">
            <Table>
                <TableHeader className="bg-muted/40">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="hover:bg-transparent border-border">
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className="h-auto py-2.5 text-[12px] font-semibold text-muted-foreground"
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                tabIndex={0}
                                className="group cursor-pointer border-border transition-colors hover:bg-muted/25 data-[state=selected]:bg-primary/10 focus-visible:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                onClick={(e) => handleRowNavigate(e, row.original.id)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        onRowActivate(row.original.id);
                                    }
                                }}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="h-auto py-2.5 align-middle">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columnCount} className="h-24 text-center text-muted-foreground">
                                No customers found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
