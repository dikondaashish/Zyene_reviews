"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { customerTableBaseColumns } from "@/components/customers/customer-table-base-columns";
import { customerTableMetricColumns } from "@/components/customers/customer-table-metric-columns";
import type { Customer } from "@/components/customers/customer-table-types";

export interface BuildCustomerTableColumnsParams {
    editingNameId: string | null;
    setEditingNameId: (id: string | null) => void;
    showVisitsSpend: boolean;
    saveName: (customer: Customer, draft: string) => void | Promise<void>;
    saveTags: (customer: Customer, tags: string[]) => void | Promise<void>;
    setOptedOut: (customer: Customer, value: boolean) => void | Promise<void>;
    onSendRequest?: (customer: Customer) => void;
    setDeleteTarget: (customer: Customer | null) => void;
    setMergeTarget: (customer: Customer | null) => void;
}

export function buildCustomerTableColumns(params: BuildCustomerTableColumnsParams): ColumnDef<Customer>[] {
    return [
        ...customerTableBaseColumns(
            params.editingNameId,
            params.setEditingNameId,
            params.saveName,
            params.saveTags
        ),
        ...customerTableMetricColumns(
            params.showVisitsSpend,
            params.setEditingNameId,
            params.setOptedOut,
            params.onSendRequest,
            params.setDeleteTarget,
            params.setMergeTarget
        ),
    ];
}
