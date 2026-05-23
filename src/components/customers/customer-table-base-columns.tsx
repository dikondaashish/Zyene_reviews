"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomerNameCell } from "@/components/customers/customer-name-cell";
import { CustomerTagsCell } from "@/components/customers/customer-tags-cell";
import {
    customerDisplayName,
    tagPillClass,
    type Customer,
} from "@/components/customers/customer-table-types";

export function customerTableBaseColumns(
    editingNameId: string | null,
    setEditingNameId: (id: string | null) => void,
    saveName: (customer: Customer, draft: string) => void | Promise<void>,
    saveTags: (customer: Customer, tags: string[]) => void | Promise<void>
): ColumnDef<Customer>[] {
    return [
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
        {
            accessorKey: "tags",
            header: "Tags",
            cell: ({ row }) => (
                <CustomerTagsCell
                    customer={row.original}
                    onSaveTags={saveTags}
                    tagPillClass={tagPillClass}
                />
            ),
        },
    ];
}
