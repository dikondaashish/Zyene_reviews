"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    Trash2,
    Send,
    Pencil,
    Eye,
    Ban,
    RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

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
    /** Matched to `review_requests` with `review_left` for this business (phone/email). */
    has_linked_review?: boolean;
    /** Marketing / review-request opt-out (not carrier SMS registry). */
    is_opted_out?: boolean;
}

function parseFullName(input: string): { first_name: string | null; last_name: string | null } {
    const t = input.trim();
    if (!t) return { first_name: null, last_name: null };
    const i = t.indexOf(" ");
    if (i === -1) return { first_name: t, last_name: null };
    const rest = t.slice(i + 1).trim();
    return { first_name: t.slice(0, i), last_name: rest || null };
}

function customerDisplayName(c: Customer): string {
    return `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
}

const TAG_PILL_CLASSES = [
    "border-chart-1/35 bg-chart-1/12 text-chart-1",
    "border-chart-2/35 bg-chart-2/12 text-chart-2",
    "border-chart-3/35 bg-chart-3/12 text-chart-3",
    "border-chart-4/35 bg-chart-4/12 text-chart-4",
    "border-primary/35 bg-primary/12 text-primary",
    "border-chart-5/35 bg-chart-5/12 text-chart-5",
];

function tagPillClass(tag: string): string {
    let h = 0;
    for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
    return TAG_PILL_CLASSES[h % TAG_PILL_CLASSES.length];
}

interface CustomerTableProps {
    data: Customer[];
    businessId: string;
    onDelete?: (id: string) => void;
    onCustomerUpdated?: (customer: Customer) => void;
    onSendRequest?: (customer: Customer) => void;
    onSelectionChange?: (selectedIds: string[]) => void;
}

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
    const [editingNameId, setEditingNameId] = React.useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = React.useState<Customer | null>(null);

    const showVisitsSpend = React.useMemo(
        () => data.some((c) => (c.visit_count ?? 0) > 0 || (c.total_spend_cents ?? 0) > 0),
        [data]
    );

    const saveName = React.useCallback(
        async (customer: Customer, draft: string) => {
            const committed = customerDisplayName(customer);
            const trimmed = draft.trim();
            if (trimmed === committed) {
                setEditingNameId(null);
                return;
            }
            const { first_name, last_name } = parseFullName(trimmed);
            try {
                const res = await fetch("/api/customers", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: customer.id,
                        businessId,
                        first_name,
                        last_name,
                    }),
                });
                const payload = await res.json();
                if (!res.ok || !payload.success) {
                    throw new Error(payload.error || "Failed to update name");
                }
                const updated = payload.data as Customer;
                onCustomerUpdated?.(updated);
                toast.success("Name updated");
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Could not save name");
            } finally {
                setEditingNameId(null);
            }
        },
        [businessId, onCustomerUpdated]
    );

    const saveTags = React.useCallback(
        async (customer: Customer, tags: string[]) => {
            try {
                const res = await fetch("/api/customers", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: customer.id,
                        businessId,
                        tags,
                    }),
                });
                const payload = await res.json();
                if (!res.ok || !payload.success) {
                    throw new Error(payload.error || "Failed to update tags");
                }
                onCustomerUpdated?.(payload.data as Customer);
                toast.success("Tags updated");
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Could not save tags");
            }
        },
        [businessId, onCustomerUpdated]
    );

    const setOptedOut = React.useCallback(
        async (customer: Customer, is_opted_out: boolean) => {
            try {
                const res = await fetch("/api/customers", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: customer.id,
                        businessId,
                        is_opted_out,
                    }),
                });
                const payload = await res.json();
                if (!res.ok || !payload.success) {
                    throw new Error(payload.error || "Failed to update");
                }
                onCustomerUpdated?.(payload.data as Customer);
                toast.success(is_opted_out ? "Marked as opted out" : "Opt-out cleared");
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Could not update");
            }
        },
        [businessId, onCustomerUpdated]
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

    const columns: ColumnDef<Customer>[] = React.useMemo(() => {
        const base: ColumnDef<Customer>[] = [
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
                    const display = customerDisplayName(customer);
                    const hasName = Boolean(display);
                    const isEditing = editingNameId === customer.id;
                    return (
                        <CustomerNameCell
                            customer={customer}
                            display={display}
                            hasName={hasName}
                            isEditing={isEditing}
                            onCancelEdit={() => setEditingNameId(null)}
                            onSave={(draft) => saveName(customer, draft)}
                        />
                    );
                },
            },
        ];

        base.push({
            accessorKey: "tags",
            header: "Tags",
            cell: ({ row }) => (
                <CustomerTagsCell
                    customer={row.original}
                    onSaveTags={saveTags}
                    tagPillClass={tagPillClass}
                />
            ),
        });

        if (showVisitsSpend) {
            base.push(
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
                    cell: ({ row }) => (
                        <div className="text-muted-foreground font-medium">
                            {row.getValue("visit_count") || 0}
                        </div>
                    ),
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
                }
            );
        }

        base.push(
            {
                accessorKey: "total_requests_sent",
                header: "Requests",
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="text-xs font-normal border-border text-muted-foreground"
                        >
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
                                <DropdownMenuContent align="end" className="w-[200px]">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setEditingNameId(customer.id);
                                        }}
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit name
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`/customers/${customer.id}`}
                                            className="flex cursor-pointer items-center"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View details
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {customer.is_opted_out ? (
                                        <DropdownMenuItem onClick={() => setOptedOut(customer, false)}>
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Clear opt-out
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem onClick={() => setOptedOut(customer, true)}>
                                            <Ban className="mr-2 h-4 w-4" />
                                            Mark as opted out
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    {customer.is_opted_out ? (
                                        <TooltipProvider delayDuration={200}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="block w-full cursor-default">
                                                        <DropdownMenuItem
                                                            disabled
                                                            className="pointer-events-none opacity-60"
                                                        >
                                                            <Send className="mr-2 h-4 w-4" />
                                                            Send Request
                                                        </DropdownMenuItem>
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent side="left" className="max-w-xs">
                                                    This contact opted out of review requests.
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : (
                                        <DropdownMenuItem onClick={() => onSendRequest?.(customer)}>
                                            <Send className="mr-2 h-4 w-4" />
                                            Send Request
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => setDeleteTarget(customer)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete customer
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            }
        );

        return base;
    }, [editingNameId, onSendRequest, saveName, saveTags, setOptedOut, showVisitsSpend]);

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
            const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);
            onSelectionChange(selectedIds);
        }
    }, [rowSelection, table, onSelectionChange]);

    const columnCount = columns.length;

    return (
        <div className="w-full">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
                <Table>
                    <TableHeader className="bg-muted/40">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-border">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className="h-auto py-2.5 text-[12px] font-semibold text-muted-foreground"
                                        >
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
                                    className="border-border transition-colors hover:bg-muted/20 data-[state=selected]:bg-primary/10 cursor-pointer"
                                    onClick={(e) => handleRowNavigate(e, row.original.id)}
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
                                <TableCell
                                    colSpan={columnCount}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No customers found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-3">
                <div className="text-xs text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-8 rounded-lg border-border px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-muted"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-8 rounded-lg border-border px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-muted"
                    >
                        Next
                    </Button>
                </div>
            </div>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This removes{" "}
                            <span className="font-medium text-foreground">
                                {deleteTarget ? customerDisplayName(deleteTarget) || "this contact" : ""}
                            </span>{" "}
                            from your list. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (deleteTarget && onDelete) {
                                    onDelete(deleteTarget.id);
                                }
                                setDeleteTarget(null);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function CustomerTagsCell({
    customer,
    onSaveTags,
    tagPillClass,
}: {
    customer: Customer;
    onSaveTags: (customer: Customer, tags: string[]) => void | Promise<void>;
    tagPillClass: (tag: string) => string;
}) {
    const [open, setOpen] = React.useState(false);
    const [input, setInput] = React.useState("");
    const tags = customer.tags ?? [];

    const commit = (next: string[]) => {
        void onSaveTags(customer, next);
    };

    const removeTag = (tag: string) => {
        commit(tags.filter((t) => t !== tag));
    };

    const addTag = () => {
        const t = input.trim();
        if (!t || tags.includes(t)) {
            setInput("");
            return;
        }
        commit([...tags, t]);
        setInput("");
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="flex max-w-[220px] flex-wrap items-center gap-1 rounded-md border border-transparent p-1 text-left transition-colors hover:border-border hover:bg-muted/40"
                    onClick={(e) => e.stopPropagation()}
                >
                    {tags.length > 0 ? (
                        tags.map((tag) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className={cn("border px-1.5 py-0 text-[10px] font-medium", tagPillClass(tag))}
                            >
                                {tag}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-xs italic text-muted-foreground">Add tags…</span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-80 space-y-3"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <p className="text-xs font-medium text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className={cn("gap-1 pr-1 font-normal", tagPillClass(tag))}
                        >
                            {tag}
                            <button
                                type="button"
                                className="rounded p-0.5 hover:bg-muted"
                                aria-label={`Remove ${tag}`}
                                onClick={() => removeTag(tag)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="New tag"
                        value={input}
                        className="h-8 text-sm"
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addTag();
                            }
                        }}
                    />
                    <Button type="button" size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={addTag}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

function CustomerNameCell({
    customer,
    display,
    hasName,
    isEditing,
    onCancelEdit,
    onSave,
}: {
    customer: Customer;
    display: string;
    hasName: boolean;
    isEditing: boolean;
    onCancelEdit: () => void;
    onSave: (draft: string) => void;
}) {
    const [draft, setDraft] = React.useState(() => (hasName ? display : ""));
    const skipBlurSave = React.useRef(false);

    React.useEffect(() => {
        if (!isEditing) {
            setDraft(hasName ? display : "");
        }
    }, [display, hasName, isEditing]);

    if (isEditing) {
        return (
            <div className="flex flex-col gap-1 min-w-[180px]">
                <Input
                    autoFocus
                    className="h-8 text-sm"
                    value={draft}
                    placeholder="Name"
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            onSave(draft);
                        }
                        if (e.key === "Escape") {
                            e.preventDefault();
                            skipBlurSave.current = true;
                            onCancelEdit();
                        }
                    }}
                    onBlur={() => {
                        if (skipBlurSave.current) {
                            skipBlurSave.current = false;
                            return;
                        }
                        onSave(draft);
                    }}
                />
                <div className="text-[10px] text-muted-foreground">
                    Enter to save · Esc to cancel · click away to save
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div
                className="text-left rounded-md px-0 py-0.5 hover:bg-muted/40"
                role={isEditing ? undefined : "presentation"}
            >
                <div className="flex flex-wrap items-center gap-2">
                    {hasName ? (
                        <span className="font-medium text-foreground">{display}</span>
                    ) : (
                        <span className="font-normal text-muted-foreground">Unnamed Customer</span>
                    )}
                    {customer.is_opted_out ? (
                        <Badge
                            variant="outline"
                            className="h-5 border-chart-4/40 bg-chart-4/10 px-1.5 text-[10px] font-medium text-chart-4"
                        >
                            Opted out
                        </Badge>
                    ) : null}
                </div>
            </div>
            <div className="flex gap-2 mt-1 flex-wrap">
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
}
