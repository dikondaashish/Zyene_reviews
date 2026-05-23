"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomerActionsDropdown } from "@/components/customers/customer-actions-dropdown";
import type { Customer } from "@/components/customers/customer-table-types";

export function customerTableMetricColumns(
    showVisitsSpend: boolean,
    setEditingNameId: (id: string | null) => void,
    setOptedOut: (customer: Customer, value: boolean) => void | Promise<void>,
    onSendRequest: ((customer: Customer) => void) | undefined,
    setDeleteTarget: (customer: Customer | null) => void
): ColumnDef<Customer>[] {
    const cols: ColumnDef<Customer>[] = [];

    if (showVisitsSpend) {
        cols.push(
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
                        <ArrowUpDown className="ml-2 size-4" />
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
                        <ArrowUpDown className="ml-2 size-4" />
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

    cols.push(
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
                    <CustomerActionsDropdown
                        customer={customer}
                        onEditName={() => setEditingNameId(customer.id)}
                        onSendRequest={() => onSendRequest?.(customer)}
                        onDelete={() => setDeleteTarget(customer)}
                        setOptedOut={setOptedOut}
                    />
                );
            },
        }
    );

    return cols;
}
