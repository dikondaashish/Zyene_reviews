"use client";

import * as React from "react";
import { toast } from "sonner";
import {
    customerDisplayName,
    parseFullName,
    type Customer,
} from "@/components/customers/customer-table-types";

export function useCustomerTableMutations(
    businessId: string,
    onCustomerUpdated?: (customer: Customer) => void
) {
    const [editingNameId, setEditingNameId] = React.useState<string | null>(null);

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
                    body: JSON.stringify({ id: customer.id, businessId, first_name, last_name }),
                });
                const payload = await res.json();
                if (!res.ok || !payload.success) {
                    throw new Error(payload.error || "Failed to update name");
                }
                onCustomerUpdated?.(payload.data as Customer);
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
                    body: JSON.stringify({ id: customer.id, businessId, tags }),
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
                    body: JSON.stringify({ id: customer.id, businessId, is_opted_out }),
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

    return { editingNameId, setEditingNameId, saveName, saveTags, setOptedOut };
}
