"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    MoreHorizontal,
    ArrowUpDown,
    Mail,
    Phone,
    Plus,
    Tag,
    Trash2,
    Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export interface Customer {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    tags: string[] | null;
    visit_count: number | null;
    total_spend_cents: number | null;
    last_request_sent_at: string | null;
    total_requests_sent: number | null;
    created_at: string;
}

interface CustomerTableProps {
    data: Customer[];
    onDelete?: (id: string) => void;
    onSendRequest?: (customer: Customer) => void;
    onSelectionChange?: (selectedIds: string[]) => void;
}

export function CustomerTable({ data, onDelete, onSendRequest, onSelectionChange }: CustomerTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const columns: ColumnDef<Customer>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: "Customer",
            cell: ({ row }) => {
                const customer = row.original;
                const name = `${customer.first_name || ""} ${customer.last_name || ""}`.trim();
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-foreground">{name || "Unnamed Customer"}</span>
                        <div className="flex gap-2 mt-1">
                            {customer.email && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" /> {customer.email}
                                </span>
                            )}
                            {customer.phone && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {customer.phone}
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "tags",
            header: "Tags",
            cell: ({ row }) => {
                const tags = row.original.tags || [];
                return (
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {tags.length > 0 ? (
                            tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-[10px] font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors">
                                    {tag}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground italic">No tags</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "visit_count",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Visits
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="text-muted-foreground font-medium">{row.getValue("visit_count") || 0}</div>,
        },
        {
            accessorKey: "total_spend_cents",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Spend
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const amount = (parseFloat(row.getValue("total_spend_cents")) || 0) / 100;
                const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                }).format(amount);
                return <div className="text-foreground font-medium">{formatted}</div>;
            },
        },
        {
            accessorKey: "total_requests_sent",
            header: "Requests",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-normal border-border text-muted-foreground">
                        {row.getValue("total_requests_sent") || 0} sent
                    </Badge>
                </div>
            ),
        },
        {
            accessorKey: "last_request_sent_at",
            header: "Last Sent",
            cell: ({ row }) => {
                const date = row.original.last_request_sent_at;
                return (
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : "Never"}
                    </div>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const customer = row.original;

                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onSendRequest?.(customer)}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Request
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Tag
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => onDelete?.(customer.id)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

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
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    React.useEffect(() => {
        if (onSelectionChange) {
            const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
            onSelectionChange(selectedIds);
        }
    }, [rowSelection, table, onSelectionChange]);

    return (
        <div className="w-full">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-border">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="py-4 text-muted-foreground font-semibold h-auto">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="border-border transition-colors hover:bg-muted/30 data-[state=selected]:bg-primary/10"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4 align-middle h-auto">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-32 text-center text-muted-foreground"
                                >
                                    No customers found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-6">
                <div className="text-sm text-muted-foreground font-medium">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="rounded-xl border-border text-muted-foreground font-medium h-9 px-4 transition-all hover:bg-muted"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="rounded-xl border-border text-muted-foreground font-medium h-9 px-4 transition-all hover:bg-muted"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
